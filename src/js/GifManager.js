module.exports = GifManager;
class GifManager{

    constructor(){
        this.DOM = {
            GIFS : document.getElementById("gifs"),
            SEARCH_VALUE : document.getElementById("searchValue"),
            PAGINATION : document.querySelector(".pagination")
        };
        this.url = "";
        this.currentQuery = {
            type:"", // search, trending
            query:"" // only on search mode
        };
        this.itemPerPage = 25;
        this.imagesWidth = 200;
        this.maxPages = 8;
        this.pageOffset = 0;
        this.currentPage = 1;
    }

    callXhr(url, callback){
        this.xhr = new XMLHttpRequest();
        this.xhr.onreadystatechange = function(){
            if (this.readyState === 4 && this.status === 200) {
                let json = JSON.parse(this.responseText);
                callback(json);
            }
        };  

        this.xhr.open("GET", url, true);
        this.xhr.send();
    }

    addImageElement(src, orgSrc ,width = null, height = null){
        let gif = document.createElement("div");
        let img = document.createElement("img");

        let gif_overlay = document.createElement("div");
        let gif_link = document.createElement("div");
        let iconFont = document.createElement("i");

        gif.className = "gif";
        gif_overlay.className = "gif-overlay";
        gif_link.className = "gif-link";
        gif_link.setAttribute("data-url", orgSrc || src);
        iconFont.className = "las la-link";

        gif.setAttribute("style", "width:"+this.imagesWidth+"px");
        gif_link.appendChild(iconFont);
        gif_overlay.appendChild(gif_link);

        let o = Math.round, r = Math.random, s = 255;
        gif.style.backgroundColor = 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) +')';
        img.src = src;

        if(width && height){
            img.width = width;
            img.height = height;
        }
        //img.setAttribute("data-src",src);
        gif.appendChild(img);
        gif.appendChild(gif_overlay);
        this.DOM.GIFS.appendChild(gif);
    }

    writeImage(json){
        let img = json.data.images.fixed_width;
        let newHeight = (this.imagesWidth / (img.width / img.height));
        this.addImageElement(img.url,this.imagesWidth, newHeight);
    }

    writeAllImages(json){
        console.log(json);  
        if(json && json.data && typeof json.data[Symbol.iterator] === 'function'){
            this.resetGifs();
            json.data.forEach((e)=>{
                let img = e.images.fixed_width;
                let newHeight = (this.imagesWidth / (img.width / img.height));
                this.addImageElement(img.url, e.images.downsized.url, this.imagesWidth, newHeight);
            });
            this.layoutImages();
        }else{
            // Call Error
        }
    }

    resetGifs(){
        this.DOM.GIFS.querySelectorAll(".gif").forEach(e=>e.remove());
    }

    layoutImages(){
        let imgLoad = imagesLoaded("#gifs");
        let gifs = this.DOM.GIFS;
        let msnry = new Masonry(gifs, {
            itemSelector: ".gif",
            columnWidth:this.imagesWidth,
            horizontalOrder: true,
            gutter:10,
            stamp:"#header",
            fitWidth: true,
        });
        imgLoad.on("always", function( instance ) {
            // images loaded
            new Masonry(gifs, {
                itemSelector: ".gif",
                columnWidth:this.imagesWidth,
                horizontalOrder: true,
                gutter:10,
                stamp:"#header",
                fitWidth: true,
            });
        });
    }

    getUrl(type){
        return `https://api.giphy.com/v1/gifs/${type}?api_key=P07BtqvnFy2oRhDG91nIivaetuFDoT9u&rating=g&lang=en`;
    }

    createPaginationItem(number, active){
        let num_page = document.createElement("div");
        num_page.className = "num-page";
        if(this.currentPage === number){
            num_page.classList.add("active");
        }
        num_page.setAttribute("data-page",number);
        num_page.innerText = number;
        this.DOM.PAGINATION.appendChild(num_page);

    }

    initPagination(result){
        this.DOM.PAGINATION.innerHTML = "";
        if(result.pagination.total_count > this.itemPerPage * 8){
            // 8 den çok sayfa var
            this.maxPages = 8;
        }else{
            // 8 den az sayfa var
            
            this.maxPages = Math.ceil(result.pagination.total_count / this.itemPerPage);
            console.log("We are here", this.maxPages);
        }

        console.log(this.maxPages);

        for(let i = 1, k = this.maxPages; i <= k;i++){
            this.createPaginationItem(i);       
        }
    }

    setPageActive(elm){
        this.DOM.PAGINATION.querySelector(".active").classList.remove("active");
        elm.classList.add("active");
    }

    getPage(page, init = false){
        this.currentPage = page;
        this.pageOffset = (this.currentPage - 1) * this.itemPerPage; // start fetching from

        let _this = this;
        let url = this.getUrl(this.currentQuery.type) + `&limit=${this.itemPerPage}&offset=${this.pageOffset}`;
        if(this.currentQuery.type === "search"){
            if(this.currentQuery.query){
                url += "&q=" + this.currentQuery.query;
            }else{
                // Call Error
                return;
            }
        }

        this.callXhr(url, function(result){
            _this.writeAllImages(result);
            if(init){
                _this.initPagination(result);
            }
        });

    }

    searchButton(_type, _query = ""){
        this.currentQuery = {
            type: _type,
            query: _query
        };
        this.getPage(1, true);
    }

    /**
     * Remember. Pagination function must work after every search. 
     * Seperate "pressing the search button" and "pressing the page button". At
     * "pressing the search button" it will set up pagination, write num-page's. At
     * "pressing the page button" it will call the current request and will use the 
     * setted data when search button clicked, not gonna do it again.
     * 
     * Suggession: 
     *  make one function for "search button": makeRequest, call**
     *  make one function for "page button": getPage
     */
    init(){
        this.currentQuery = {
            type:"trending",
            query:""
        }
        if(window.innerWidth < (this.imagesWidth * 2) + 10){
            this.imagesWidth = Math.ceil((window.innerWidth / 2)) - 10;
        }
        this.getPage(1, true);
    }
}