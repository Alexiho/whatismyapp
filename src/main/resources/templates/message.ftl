<#include "header.ftl">

<div class="row">
  <div class="col-md-12 mt-1">
    <h1 class="display-4">WhatIsMyApp</h1>
  </div>

  <div class="col-md-12 mt-1">
    <#list message>
      <h2>Message: </h2>
      <ul>
        <#items as message_data>
          <li>
            <a>${message_data}</a>
          </li>
        </#items>
      </ul>
    </#list>
  </div>

</div>

<#include "footer.ftl">
