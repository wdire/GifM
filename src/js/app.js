(function(){

    const copyToClipboard = str => {
        const el = document.createElement('textarea');
        el.value = str;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        const selected =
          document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        if (selected) {
          document.getSelection().removeAllRanges();
          document.getSelection().addRange(selected);
        }
    };

    //let observer = lozad('.image');

    let gifManager = new (require("./GifManager.js"))();
    gifManager.init();

    document.getElementById("searchBtn").addEventListener("click", function(){
        gifManager.searchButton("search", searchValue.value);
    });

    gifManager.DOM.SEARCH_VALUE.addEventListener("keydown", function(e){
        if(e.keyCode && e.keyCode === 13){
            gifManager.searchButton("search", this.value);
        }
    });

    document.getElementById("get-trending").addEventListener("click", function(){
        gifManager.searchButton("trending");
    });

    document.addEventListener("click", function(e){
        let elm = e.target;
        if(!elm || !elm.className) return;
        if(elm.className === "categories-item search"){
            gifManager.DOM.SEARCH_VALUE.value = elm.innerText;
            gifManager.searchButton("search",elm.getAttribute("data-query"));
        }

        if(elm.className === "gif-link"){
            copyToClipboard(elm.getAttribute("data-url"));
            console.log()
            alert("Gif Link Copied to Clipboard");
        }

        if(elm.className === "num-page"){
            gifManager.setPageActive(elm);
            gifManager.getPage(elm.getAttribute("data-page"));
        }
    });
})();