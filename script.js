
var templates = {
    "shop":
        '<li class="item">'
        +   '<img src="img/{{name}}.jpg" alt=""><br>'
        +   'price:{{price}}<br>'
        +   '<input type="button" value="buy" onclick=buy("{{name}}")>'
        +'</li><br>',
    "inventory":
        '<li class="item" id="{{id}}">'
        +   'weapon:<img src="img/{{name}}.jpg" alt=""><br>'
        +   'price:{{price}}<br>'
        +   'level:{{level}} <br>'
        +   '<input type="button" value="sell" onclick="sell({{id}})">'
        +   '<input type="button" value="update" onclick="upgrade({{id}})">'
        +'</li>'
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
                "balance":10000,
                "upgrade_kits":0,
                "weapons":[]
            }
        ))
    }

    return JSON.parse(localStorage.getItem("user_info"));
}

function show_user_info(user_info){
    $(".inventory").html("");
    $("#money").text(user_info.balance);
    $("#upgrade_kits").text(user_info.upgrade_kits);
    show_items("inventory", user_info.weapons);
}

function show_items(destination, response){
    response = response || [];
    for(var i = 0; i < response.length; i++){
        $("."+destination).append(createView(destination, response[i]));
    }
}

function createView(template_name, data){
    var params = ["id","name","level", "price"];
    var template = templates[template_name];
    for(var k = 0; k < params.length; k++){
        template = template.replace(new RegExp("{{"+params[k]+"}}", "g"), data[params[k]] || 0);
    }

    return template;
}

function buy(item_name){
    var user_info = load_user_info();
    var item = JSON.parse(localStorage.getItem("shop")).filter(function( obj ) {
        return obj.name == item_name;
    })[0];

    if( user_info.balance > item["price"] ){
        if(item["name"] == "upgrade_kit"){
            user_info.balance -= item["price"];
            user_info.upgrade_kits++;
        }else{
            item["id"] = new Date().getTime();
            item["level"] = 0;
            item["price"] = Math.round(item["price"]/100*80);
            user_info.weapons.push(item);
            user_info.balance -= item["price"];
        }
        show_user_info(user_info);
        localStorage.setItem("user_info", JSON.stringify(user_info));
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
        if (Math.floor(Math.random()*100) < 63 || item["level"] < 3){
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
            user_info.weapons = $.grep(user_info.weapons, function(weapon) {
                return weapon.id !== item["id"];
            });
        }
        show_user_info(user_info);
        localStorage.setItem("user_info", JSON.stringify(user_info));
    }else{
        alert("Not enough upgrade kits. Come on, buy one more :)");
    }
}