
var templates = {
    "shop":
     '<tr class="item">'
        +'<td><img src="img/{{name}}.jpg" alt=""><div class="level">{{level}}</div></td>'
        +'<td>{{price}}</td>'
        +'<td><input type="number" min="1" value="1"></td>'
        +'<td><input type="button" value="buy" onclick=buy("{{id}}")></td>'
    +'</tr>',
    "inventory":
        '<div class="item" id="{{id}}">'
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

    if( user_info.balance > item["price"] ){
        if(item["name"] == "upgrade_kit"){
            user_info.balance -= item["price"];
            user_info.upgrade_kits++;
        }else{
            user_info.balance -= item["price"];
            var prices = JSON.parse(localStorage.getItem("prices"));

            item["id"] = new Date().getTime();
            item["price"] = item["price"]/100*80 + 1050*item["level"] + prices[item["level"]];
            user_info.weapons.push(item);
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
        // if (Math.floor(Math.random()*100) < 63 || item["level"] < 2){
        if (true){
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