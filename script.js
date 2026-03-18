document.querySelectorAll(".collapse-toggle").forEach(el => el.remove());

var boardid = window.location.href.substring(
  window.location.href.indexOf("/b/") + 3,
  window.location.href.indexOf("/b/") + 11
);

document.querySelectorAll("h2[data-testid='list-name']").forEach(e => 
{
  var columnName = encodeURI(e.textContent);

  // ✨ Count cards in this list
  var cardCount = e.closest("[data-testid='list']").querySelectorAll("[data-testid='trello-card']").length;

  chrome.storage.local.get(boardid + ":" + columnName, isClosed => 
  {
    if (isClosed[boardid + ":" + columnName]) 
    {
      e.parentNode.parentNode.parentNode.classList.add("-closed");
      e.parentNode.parentNode.parentNode.classList.add("-cl");
    }

    var toggle = document.createElement("div");
    toggle.className = "collapse-toggle";

    // ✨ Set card count as a data attribute for CSS to pick up
    toggle.dataset.count = cardCount;

    toggle.addEventListener("click", evt => 
    {
      var thisColumn = encodeURI(evt.target.nextSibling.textContent);

      // ✨ Refresh card count on toggle (list may have changed)
      var freshCount = evt.target.closest("[data-testid='list']").querySelectorAll("[data-testid='trello-card']").length;
      evt.target.dataset.count = freshCount;

      chrome.storage.local.set(
      {
        [boardid + ":" + thisColumn]: isClosed[boardid + ":" + columnName]
          ? null
          : true
      },
      res => 
      {
        evt.target.parentNode.parentNode.parentNode.classList.toggle("-closed");
        evt.target.parentNode.parentNode.parentNode.classList.toggle("-cl");
      });
    });

    e.parentNode.insertBefore(toggle, e);
  });
  
  var isClosed, openList;
  document.querySelectorAll("div[data-testid='list']").forEach(lc => 
  {
    lc.addEventListener("dragenter", lce => 
    {
      document.querySelectorAll("div[data-testid='list'].-cl").forEach(l => 
      {
        const c = l.getBoundingClientRect();
        if (lce.pageX > c.left && lce.pageX < c.right && lce.pageY > c.top && lce.pageY < c.bottom) 
        {
          if (!openList) 
          {
            openList = setTimeout(() => 
            {
              l.classList.add("-open");
              l.classList.remove("-closed");
            }, 250);
          }
        } 
        else 
        {
          clearTimeout(openList);
          openList = null;

          if (l.classList.contains("-open")) 
          {
            l.classList.remove("-open");
            l.classList.add("-closed");
          }
        }
      });
    });
  });
}