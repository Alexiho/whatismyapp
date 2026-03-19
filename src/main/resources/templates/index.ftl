<#include "header.ftl">

<div class="row">
  <div class="col-md-12 mt-1">
    <div class="float-xs-right">
      <form class="form-inline" action="/api/messages" method="post">
        <div class="form-group">
          <input type="text" class="form-control" id="author" name="author" placeholder="Username">
          <input type="text" class="form-control" id="content" name="content" placeholder="Write your message">
        </div>
        <button type="submit" class="btn btn-primary" >Create</button>
      </form>
    </div>
    <h1 class="display-4">WhatIsMyApp</h1>
  </div>

  <div class="col-md-12 mt-1">
    <#list messages>
      <h2>Chat: </h2>
      <ul>
        <#items as message>
          <li>
            <#list message>
              <#items as message_data>
                <a>${message_data}</a>
              </#items>
            </#list>
          </li>
        </#items>
      </ul>
    </#list>
  </div>

</div>

<#include "footer.ftl">
