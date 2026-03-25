// src/hooks/useEventBus.js
import {useEffect, useRef, useState} from 'react';
import EventBus from '@vertx/eventbus-bridge-client.js'; // si installé via npm
import SockJS from 'sockjs-client';

export default function useEventBus() {
  const ebRef = useRef(null);
  const rawSockRef = useRef(null);
  const processedIdsRef = useRef(new Set());
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  // Helpers pour remplacer ou ajouter des messages côté UI avec déduplication
  const replaceUiMessages = (uiMessages) => {
    const newSet = new Set();
    uiMessages.forEach(m => {
      const key = m.id ?? JSON.stringify(m);
      newSet.add(key);
    });
    processedIdsRef.current = newSet;
    setMessages(uiMessages);
  };

  const appendUiMessageIfNew = (ui) => {
    const key = ui.id ?? JSON.stringify(ui);
    if (processedIdsRef.current.has(key)) return;
    processedIdsRef.current.add(key);
    setMessages(prev => [...prev, ui]);
  };

  // helper pour normaliser un élément de message (cas tableau vs objet)
  const normalizeMessageItem = (item) => {
    console.log('Normalizing message item:', item);
    if (!item) return null;
    // Si le serveur a stringifié l'élément
    if (typeof item === 'string') {
      try {
        const parsed = JSON.parse(item);
        return normalizeMessageItem(parsed);
      } catch (e) {
        // si ce n'est pas du JSON, utiliser tel quel comme content
        return { id: null, author: null, date: null, content: item };
      }
    }

    if (Array.isArray(item)) {
      // Parfois les éléments sont des strings à l'intérieur d'un tableau
      // [id, author, date, content]
      const id = typeof item[0] !== 'undefined' ? item[0] : null;
      const author = typeof item[1] !== 'undefined' ? item[1] : null;
      const date = typeof item[2] !== 'undefined' ? item[2] : null;
      let content = typeof item[3] !== 'undefined' ? item[3] : null;
      if (typeof content === 'string') {
        // tenter de parser si c'est un JSON stringifié
        try { content = JSON.parse(content); } catch (e) { /* keep string */ }
      }
      // garantir que content est une chaîne
      if (content && typeof content !== 'string') {
        try { content = String(content); } catch (e) { content = JSON.stringify(content); }
      }
      return { id, author, date, content };
    }
    if (typeof item === 'object') {
      // si déjà un objet, tenter de normaliser les noms
      let content = item.content ?? item.message ?? item.text ?? null;
      if (typeof content === 'object' && content !== null) {
        try { content = JSON.stringify(content); } catch (e) { content = String(content); }
      }
      return {
        id: item.id ?? item._id ?? null,
        author: item.author ?? item.from ?? item.userName ?? null,
        date: item.date ?? item.timestamp ?? null,
        content: content
      };
    }
    return null;
  };

  const normalizeMessagesArray = (arr) => {
    if (!Array.isArray(arr)) return [];
    const out = arr.map(normalizeMessageItem).filter(Boolean);
    // log si certains éléments n'ont pas été normalisés
    if (out.length !== arr.length) console.warn('normalizeMessagesArray: some items could not be normalized', arr, out);
    return out;
  };

  // parser les frames brutes SockJS du format a["{...}"] ou "..."
  const parseSockJSFrame = (raw) => {
    if (!raw) return [];
    try {
      raw = String(raw);
      if (raw.startsWith('a[')) {
        const inner = raw.slice(2, -1); // enlève a[ et ]
        // inner est typiquement un ensemble de strings séparés par commas
        const arr = JSON.parse('[' + inner + ']');
        return arr.map(s => {
          try { return JSON.parse(s); } catch (e) { return null; }
        }).filter(Boolean);
      }
      // sinon tenter de parser comme JSON direct
      if (raw.startsWith('{') || raw.startsWith('[')) {
        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { return []; }
      }
      return [];
    } catch (err) {
      console.warn('parseSockJSFrame failed', err, raw);
      return [];
    }
  };

  // Tentative récursive de parsing JSON pour dés-encapsuler les stringifications multiples
  const deepParseJSON = (value, depth = 0) => {
    if (depth > 5) return value; // éviter boucle infinie
    if (value == null) return value;
    if (typeof value !== 'string') return value;
    const s = value.trim();
    // gérer frames sockjs a["..."]
    if (s.startsWith('a[') || s.startsWith('[') || s.startsWith('{')) {
      // Try parsing SockJS frame first
      const objs = parseSockJSFrame(s);
      if (objs.length === 1) return objs[0];
      if (objs.length > 1) return objs;
    }
    try {
      const parsed = JSON.parse(s);
      // si parsed est une string encore, récursion
      if (typeof parsed === 'string') return deepParseJSON(parsed, depth + 1);
      return parsed;
    } catch (e) {
      return value;
    }
  };

  useEffect(() => {
    console.log('messages state updated (count):', messages.length);
    if (messages.length > 0) console.log('messages state sample[0]:', messages[0]);
  }, [messages]);

  useEffect(() => {
    const url = 'http://10.106.163.109:8080/eventbus';
    const eb = new EventBus(url);
    ebRef.current = eb;

    // fonction utilitaire pour traiter un body candidat
    const processBodyCandidate = (bodyCandidate) => {
      let body = bodyCandidate;
      console.log('Processing body candidate:', bodyCandidate);
      if (!body) { console.warn('processBodyCandidate: empty candidate', bodyCandidate); return; }

      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { console.warn('processBodyCandidate: failed to parse string body', body); return; }
      }

      // Si la structure enveloppe encore
      if ((!body || typeof body !== 'object') && bodyCandidate && bodyCandidate.body) {
        try { body = typeof bodyCandidate.body === 'string' ? JSON.parse(bodyCandidate.body) : bodyCandidate.body; } catch (e) { /* ignore */ }
      }

      if (!body) { console.warn('processBodyCandidate: no body after normalization', bodyCandidate); return; }

      console.log('processBodyCandidate normalized body:', body);

      if (body && body.kind === 'last' && Array.isArray(body.messages)) {
        const normalized = normalizeMessagesArray(body.messages);
        console.log('Replacing messages with', normalized.length, 'items, example:', normalized[0]);
        // Map to UI-friendly shape {id, userName, message}
        const uiMessages = normalized.map(n => ({
          id: n.id ?? null,
          userName: n.author ?? 'Unknown',
          message: n.content ?? ''
        }));
        // Remplacer via helper pour reconstruire le set de déduplication
        replaceUiMessages(uiMessages);
        return;
      }
      if (body && body.kind === 'new' && body.message) {
        const normalizedNew = Array.isArray(body.message) ? normalizeMessageItem(body.message) : normalizeMessageItem(body.message);
        console.log('Appending new message:', normalizedNew);
        const uiNew = {
          id: normalizedNew?.id ?? null,
          userName: normalizedNew?.author ?? 'Unknown',
          message: normalizedNew?.content ?? ''
        };
        appendUiMessageIfNew(uiNew);
        return;
      }
      console.debug('processBodyCandidate: unknown structure', body);
    };

    // Handler extrait pour pouvoir l'enregistrer dans onopen
    const handleEvent = function(...args) {
      console.log('Received event on messages - raw args:', args);
      let evt = null;
      if (args.length === 1) evt = args[0];
      else if (args.length >= 2) {
        if (args[0]) console.warn('EventBus handler received error as first arg:', args[0]);
        evt = args[1] || args[0];
      }

      if (!evt) {
        console.warn('No event object available in handler');
        return;
      }

      // Si evt est une string (frame brute SockJS a["... "]) on la parse
      if (typeof evt === 'string') {
        console.log('Handler received raw string frame, will parse SockJS frame');
        const objs = parseSockJSFrame(evt);
        objs.forEach(obj => {
          // certains objets ont la forme {type, address, body}
          const candidateBody = obj.body || obj;
          processBodyCandidate(candidateBody);
        });
        return;
      }

      // evt peut être un objet {type, address, body}
      if (typeof evt === 'object' && evt !== null) {
        // prendre evt.body, mais d'abord deepParse au cas où c'est stringifié
        const maybeBody = deepParseJSON(evt.body);
        processBodyCandidate(maybeBody);
        return;
      }

      // sinon evt peut déjà être le body
      processBodyCandidate(deepParseJSON(evt));
    };

    // Le client EventBus exige que l'on enregistre les handlers après l'ouverture.
    // On enregistre donc dans onopen : cela évite INVALID_STATE_ERR et assure
    // que le handler est (ré)installé à chaque reconnexion.

    eb.onopen = () => {
      setConnected(true);
      console.log('EventBus opened');
      try {
        eb.registerHandler('messages', handleEvent);
        console.log('Handler registered on messages (in onopen)');
      } catch (err) {
        console.warn('Failed to register handler in onopen', err);
      }
      ebRef.current = eb;
    };

    console.log('Register handler defined');
    eb.enableReconnect(true);

    // Workaround: ouvrir une connexion SockJS brute pour attraper les frames
    try {
      const sock = new SockJS(url);
      rawSockRef.current = sock;
      sock.onopen = () => console.log('Raw SockJS opened (workaround)');
      sock.onmessage = (e) => {
        // e.data peut être du format a["{...}"]
        const objs = parseSockJSFrame(e.data);
        objs.forEach(obj => {
          // certains objets ont {type, address, body}
          const candidate = obj.body || obj;
          // ne traiter que les messages pour l'adresse 'messages' si présente
          if (obj.address && obj.address !== 'messages') return;
          // deep parse si nécessaire
          const body = deepParseJSON(candidate);
          processBodyCandidate(body);
        });
      };
      sock.onclose = () => console.log('Raw SockJS closed (workaround)');
    } catch (err) {
      console.warn('Could not create raw SockJS workaround', err);
    }

    // Cleanup au démontage du composant
    return () => {
      try {
        if (ebRef.current) {
          ebRef.current.close();
          ebRef.current = null;
        }
      } catch (err) {
        console.warn('Error while closing EventBus', err);
      }
      try {
        if (rawSockRef.current) {
          rawSockRef.current.close();
          rawSockRef.current = null;
        }
      } catch (err) {
        console.warn('Error while closing raw SockJS', err);
      }
    };
  }, []);

  const sendMessage = (author, content) => {
    // Utiliser l'état `connected` (mis à true dans onopen) pour décider
    if (!ebRef.current || !connected) {
      console.warn('EventBus not connected : ', author, content, ebRef.current);
      return;
    }
    console.log(ebRef.current);
    // envoyer sur la même adresse que le serveur consomme
    console.log("Sending message via EventBus : ", {author, content});
    ebRef.current.send('messages', {"author": author, "content":content});

  };

  return {connected, messages, sendMessage};
}
