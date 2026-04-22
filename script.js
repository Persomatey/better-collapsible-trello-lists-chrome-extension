let openList;

function waitForBoardStable(callback) {
    let lastListCount = 0;
    let lastCardCount = 0;
    let stableTicks = 0;

    const interval = setInterval(() => {
        const listCount = document.querySelectorAll("[data-testid='list']").length;
        const cardCount = document.querySelectorAll("[data-testid='trello-card']").length;

        if (listCount === lastListCount && cardCount === lastCardCount) {
            stableTicks++;
        } else {
            stableTicks = 0;
            lastListCount = listCount;
            lastCardCount = cardCount;
        }

        // Slightly faster than before, since lists stabilize quicker
        if (stableTicks > 4) {
            clearInterval(interval);
            callback();
        }
    }, 300);
}

waitForBoardStable(() => {

    document.querySelectorAll(".collapse-toggle").forEach(el => el.remove());

    var boardid = window.location.href.substring(
        window.location.href.indexOf("/b/") + 3,
        window.location.href.indexOf("/b/") + 11
    );

    document.querySelectorAll("h2[data-testid='list-name']").forEach(e => 
    {
        var rawColumnName = e.textContent.trim();
        var columnName = encodeURI(rawColumnName);
        var list = e.closest("[data-testid='list']");
        var key = boardid + ":" + columnName;

        // Count cards AFTER Trello is stable
        var cardCount = list.querySelectorAll("[data-testid='trello-card']").length;

        chrome.storage.local.get(key, isClosed => 
        {
            if (isClosed[key])
            {
                list.classList.add("-closed");
                list.classList.add("-cl");
            }

            var toggle = document.createElement("div");
            toggle.className = "collapse-toggle";

            var label = document.createElement("div");
            label.className = "collapse-label";
            label.textContent = rawColumnName;

            toggle.appendChild(label);

            const wrapper = document.createElement("div");
            wrapper.className = "toggle-wrapper";

            const header = e.closest("[data-testid='list-header']");
            header.prepend(wrapper);

            wrapper.appendChild(toggle);
            wrapper.appendChild(e);

            toggle.dataset.count = cardCount;
            toggle.dataset.name = rawColumnName;

            toggle.addEventListener("click", evt => 
            {
                var thisColumn = encodeURI(evt.target.nextSibling.textContent);

                var freshCount = evt.target.closest("[data-testid='list']")
                    .querySelectorAll("[data-testid='trello-card']").length;

                evt.target.dataset.count = freshCount;

                chrome.storage.local.set(
                {
                    [key]: isClosed[key] ? null : true
                },
                res => 
                {
                    list.classList.toggle("-closed");
                    list.classList.toggle("-cl");
                });
            });
        });
    });

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

});