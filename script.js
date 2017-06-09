
var templates = {
    "shop":
        '<li class="item">'
        +   '<img src="img/{{name}}.jpg" alt=""><br>'
        +   'price:{{price}}<br>'
        +   '<input type="button" value="buy" onclick="buy({{name}})">'
        +'</li><br>',
    "inventory":
        '<li class="item">'
        +   'weapon:<img src="img/{{name}}.jpg" alt=""><br>'
        +   'price:{{price}}<br>'
        +   'level:{{level}} <br>'
        +   '<input type="button" value="sell" onclick="sell({{id}})">'
        +   '<input type="button" value="update" onclick="update{{id}}">'
        +'</li>'
};

window.onload = function(){
    load_shop();
    load_user_info();
};

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
    }else{
        var user_info =JSON.parse(localStorage.getItem("user_info"));
        $("#money").text(user_info.balance);
        $("#upgrade_kits").text(user_info.upgrade_kits);
        show_items("inventory", user_info.weapons);
    }
}

function show_items(destination, response){
    response = response || [];
    for(var i = 0; i < response.length; i++){
        $("."+destination).append(createView(destination, response[i]));
        console.log("added");
    }
}

function createView(template_name, data){
    var params = ["id","name","level", "price"];
    var template = templates[template_name];
    for(var k = 0; k < params.length; k++){
        template = template.replace(new RegExp("{{"+params[k]+"}}", "g"), data[params[k]] || "");
    }

    return template;
}