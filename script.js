
var templates = {
    "shop":
     '<tr class="item">'
        +'<td><img src="img/{{name}}.jpg" alt=""><div class="level">{{level}}</div></td>'
        +'<td>{{price}}</td>'
        +'<td><input type="number" min="1" value="1" class="{{id}}"></td>'
        +'<td><input type="button" value="buy" onclick=buy("{{id}}")></td>'
    +'</tr>',
    "inventory":
        '<div class="item" id="{{id}}" onclick="show_details(event,{{id}})">'
        +   '<img src="img/{{name}}.jpg" alt="">'
        +   '<input type="hidden" value="{{price}}">'
        +   '<div class="level">{{level}}</div>'
        +'</div>'
};

window.onload = function(){
    load_shop();
    show_user_info(load_user_info());
    load_prices();
};

function load_prices(){
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange= function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                localStorage.setItem("prices",httpRequest.responseText);
            }
        }
    };
    httpRequest.open('GET', "./storage/prices.json");
    httpRequest.send();
}

function load_shop() {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange= function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                localStorage.setItem("shop",httpRequest.responseText);
                show_items("shop",JSON.parse(httpRequest.responseText));
            }
        }
    };
    httpRequest.open('GET', "./storage/shop.json");
    httpRequest.send();
}

function load_user_info(){
    if(!localStorage.getItem("user_info")){
        localStorage.setItem("user_info",JSON.stringify(
            {
                "balance": 100000,
                "upgrade_kits":0,
                "weapons":[]
            }
        ))
    }

    return JSON.parse(localStorage.getItem("user_info"));
}

function show_details(event,item_id){
    var context_menu = $(".modal");
    context_menu.show();

    var user_info = load_user_info();
    var item = user_info.weapons.filter(function( obj ) {
        return obj.id == item_id;
    })[0];

    var top = event.clientY;
    var left = event.clientX;

    context_menu.css("top",top+$(window).scrollTop()+"px");
    context_menu.css("left",left+"px");

    context_menu.html('<input type="button" value="sell('+item['price']+')" onclick="sell('+item_id+')">'+
                        '<input type="button" value="upgrade" onclick="upgrade('+item_id+')">');
    
    $(".inventory_items").scroll(function(){
        hide_details();
    });
    $("body").click(function(event){
        if(event.target.parentNode.classList[0]!= "item"){
            hide_details()
        }
    })
}
function hide_details(){
    $(".modal").hide();
    $(".inventory_items").off("scroll");
    $("body").off("click");
}


function show_user_info(user_info){
    $(".inventory_items").html("");
    $("#money").text(user_info.balance);
    $("#upgrade_kits").text(user_info.upgrade_kits);
    show_items("inventory", user_info.weapons);
}

function show_items(destination, response){
    response = response || [];
    for(var i = 0; i < response.length; i++){
        $("."+destination+"_items").append(createView(destination, response[i]));
    }
}

function createView(template_name, data){
    var params = ["id","name","level", "price"];
    var template = templates[template_name];
    for(var k = 0; k < params.length; k++){
        template = template.replace(new RegExp("{{"+params[k]+"}}", "g"), data[params[k]] || 0);
    }

    if($("<div>"+template+"</div>").find(".level")[0].innerHTML == "0"){
        template = template.replace('<div class="level">0</div>',"");
    }
    return template;
}

function buy(id){
    var user_info = load_user_info();
    var item = JSON.parse(localStorage.getItem("shop")).filter(function( obj ) {
        return obj.id == id;
    })[0];
    var count = $("."+id)[0].value;
    if(!(Number.isInteger(Number(count)) && count > 0)){
        alert("Please enter correct value");

        return;
    }
    if( user_info.balance > item["price"]*count ){
        user_info.balance -= item["price"]*count;
        for(var i = 0; i < count; i++){
            if(item["name"] == "upgrade_kit"){
                user_info.upgrade_kits++;
            }else{
                var prices = JSON.parse(localStorage.getItem("prices"));
                item["id"] = new Date().getTime();
                item["level"] = item["level"]||0;
                item["price"] = item["price"]/100*80 + ((1050*item["level"])||0) + ((prices[item["level"]])||0);
                user_info.weapons.push(item);

            }
            show_user_info(user_info);
            localStorage.setItem("user_info", JSON.stringify(user_info));
        }
    }else{
        alert("Not enough money!");
    }
}

function sell(item_id){
    var user_info = load_user_info();
    var item = user_info.weapons.filter(function( obj ) {
        return obj.id == item_id;
    })[0];

    if(item){
        user_info.weapons = $.grep(user_info.weapons, function(weapon) {
            return weapon.id !== item["id"];
        });
        user_info.balance += item["price"];
    }
    show_user_info(user_info);
    localStorage.setItem("user_info", JSON.stringify(user_info));
}

function upgrade(item_id){
    var user_info = load_user_info();
    var item = user_info.weapons.filter(function( obj ) {
        return obj.id == item_id;
    })[0];

    if (user_info.upgrade_kits >= 1){
        user_info.upgrade_kits--;
        if (Math.floor(Math.random()*100) < 63 || item["level"] < 2){
            var audio = new Audio('/sounds/success.mp3');
            var default_price = JSON.parse(localStorage.getItem("shop")).filter(function( obj ) {
                return obj.name == item["name"];
            })[0].price;
            var prices = JSON.parse(localStorage.getItem("prices"));
            $.each(user_info.weapons, function() {
                if (this.id == item["id"]) {
                    this.level++;
                    this.price = default_price/100*80 + 1050*this.level + prices[this.level];

                    return false;
                }

                return true;
            });
        }else{
            var audio = new Audio('/sounds/fault.mp3');
            user_info.weapons = $.grep(user_info.weapons, function(weapon) {
                return weapon.id !== item["id"];
            });
        }
        audio.play();
        show_user_info(user_info);
        localStorage.setItem("user_info", JSON.stringify(user_info));
    }else{
        alert("Not enough upgrade kits. Come on, buy one more :)");
    }
}