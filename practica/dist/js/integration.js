$(document).ready(function() {
    /*
    * nextInput1 ---> trapezium
    * nextInput2 ---> simpson-1-3
    */
    var nextInput1 = 1;
    var nextInput2 = 1;

    var prueba = new Array(1,0.718281828,1.1,0.804166024,1.2,0.929116923,1.3,1.069296668,1.4,1.255199967,1.5,1.48168907,1.6,1.753032424,1.7,2.073947392,1.8,2.449647464,1.9,2.885894442,2,3.389056099);
    var prueba2 = new Array(1,2.635802,1.1,2.676796,1.2,2.716208,1.3,2.753612,1.4,2.788694,1.5,2.821241,1.6,2.851123,1.7,2.878282,1.8,2.902721,1.9,2.924491,2,2.943681,2.1,2.960411,2.2,2.974825);

    $("#trapezium-add-point").on("click", function(event) {
        nextInput1 = add_point(nextInput1, "trapezium-control-points", "t");
    });

    $("#simpson-1-3-add-point").on("click", function(event) {
        nextInput2 = add_point(nextInput2, "simpson-1-3-control-points", "s13");
    });

    $("#trapezium-erase-point").on("click", function(event){
        nextInput1 = erase_point(nextInput1, "t");
    });
    $("#simpson-1-3-erase-point").on("click", function(event){
        nextInput2 = erase_point(nextInput2, "s13");
    });

    //Trapezium method
    $("#method1").on("click", function(event) {
        var arr = new Array();
        var x = new Array();
        var y = new Array();

        //arr = fill_array("trapezium", nextInput1);
        arr = prueba2;

        x = divide_array_x(arr);
        y = divide_array_y(arr);

        trapezium0(arr.length/2, x, y);
        trapezium1(arr.length/2, x, y);
        trapezium2();

    });

    //Simpson 1/3 method
    $("#method2").on("click", function(event) {
        var arr = new Array();
        var x = new Array();
        var y = new Array();

        //arr = fill_array("simpson-1-3", nextInput2);
        arr = prueba2;

        x = divide_array_x(arr);
        y = divide_array_y(arr);

        simpson_1_3_0(arr.length/2, x, y);
        simpson_1_3_1(arr.length/2, x, y);
        simpson_1_3_2();

    });
});

/********************     Buttons functions   ***************************************/

function add_point(nextInput, id, method){
    var equ = '';
    equ += '<div class="row" id='+method+'id'+nextInput+'><div class="col-lg-6"><span>X:</span><input class="form-control" id="'+method+'x'+nextInput+'"></div><div class="col-lg-6"><span>Y:</span><input class="form-control" id="'+method+'y'+nextInput+'"></div></div>';

    $("#"+id).append(equ);
    nextInput++;

    return nextInput;
}
function erase_point(nextInput, method){
    nextInput--;
    $("#"+method+"id"+nextInput).remove();
    return nextInput;
}

/************************************************************************************/ 
function divide_array_x(arr){
    var res = new Array();
    var cont = 0;
    for (var i = 0; i < arr.length; i+=2) {
        res[cont]=arr[i];
        cont++;
    };
    return res;
}
function divide_array_y(arr){
    var res = new Array();
    var cont = 0;
    for (var i = 1; i < arr.length; i+=2) {
        res[cont]=arr[i];
        cont++;
    };
    return res;
}
//id
function fill_array(method, lenght){
    var length = 0;
    var id = "";

    var arr = new Array();

    id = method+"-control-points";

    $("#"+id+" input").each(function(){
        arr[length] = $(this).val();
        length++;
    })
    return arr;
}
function matrixFill(size){
        var rows = size;
        var f = new Array();

        for (var i = 0; i <= rows; i++) {
            f[i] = new Array();
            for (var j = 0; j < rows; j++) {
                f[i][j] = $("#matrix"+'i'+i+'j'+j).val();
            };
        };

        return f;
}
function mat_out(arr, method){
    $("#"+method+"-mat").empty();
    
    var rows =arr.length;
    var equ = "";
    if(method == "trapezium"){
         for (var i = 0; i < rows; i++) {
            equ ='<div class="col-lg-2" >';
            for (var j = 0; j < rows; j++) {
                if(i == j){
                    equ += '<input class="form-control" style="width=30px; background-color: #286090; color: #fff;" value="'+arr[j][i]+'"  id="matrixi'+i+'j'+j+'"><br>';
                }else{
                    equ += '<input class="form-control" style="width=30px;" value="'+arr[j][i]+'"  id="matrixi'+i+'j'+j+'"><br>';
                }
            };
           equ += '</div>';
           $("#"+method+"-mat").append(equ);
        };
    }
}
/***********************************************************************************/
function trapezium0(size, x, y){
    var h = parseFloat(x[size-1]) - parseFloat(x[0]);
    var trapezium = (parseFloat(y[size-1]) + parseFloat(y[0]))/2;

    var result = parseFloat(trapezium)*parseFloat(h);

    $("#trapezium-area").empty();
    $("#trapezium-area").append('Result = '+ result);
}

function trapezium1(size, x, y){
    var h = parseFloat(x[size-1]) - parseFloat(x[size-2]);
    var sum = parseFloat(y[0]);
    var aux = 0;

    for(var i=1; i<size-1; i++){
        aux += parseFloat(y[i]);
    };

    aux *= 2;
    sum += parseFloat(aux) + parseFloat(y[size-1]);

    var result = (sum * h)/2;

    $("#trapezium-area").append('<br>(Widespread) Result = ' + result);

}

function trapezium2(){
    var f1 = document.getElementById("trapezium-input_f").value;
    var f2 = document.getElementById("trapezium-input_f_2").value;

    var a = parseFloat($("#trapezium-a").val());
    var b = parseFloat($("#trapezium-b").val());

    var intervals = parseFloat($("#trapezium-size").val());

    var temp = 0;
    var h = 0;
    var sum = 0;

    var formula = '';
    var formula2 = '';

    var result = 0;
    var error = 0;
    var zi = parseFloat($("#trapezium-zi").val());

    $("#trapezium-mat").empty();
    $("#trapezium-mat").append('Function : ' + f1 + ' between ['+a+' , '+b+']. <br>');

    h = (b-a)/intervals;

    var aux_a = valueOf_fp({
                "x": a,
                "y": 0
            }, f1);
    var aux_b = valueOf_fp({
                "x": b,
                "y": 0
            }, f1);
    sum = aux_a + aux_b;

    formula = ' h/2 + [ F('+a+') + 2 * ( ';
    formula2 = (h/2) + ' [ '+aux_a+' + 2 * ( ';

    for (var i = 1; i < intervals; i++) {
        aux_a = valueOf_fp({
                "x": a+i*h,
                "y": 0
            }, f1);

        temp += aux_a;

        formula += ' f( '+(a+i*h)+' ) ';
        formula2 += aux_a;

        if(i < intervals-1){
            formula += ' + ';
            formula2 += ' + ';
        }
    };

    sum += 2*temp;

    formula += ') + f('+b+') ]';
    formula2 += ') + '+ aux_b+' ]';

    result = (h/2)*sum;
    
    aux_a = valueOf_fp({
                "x": zi,
                "y": 0
            }, f2);

    error = Math.pow(b-a,3)/(12*Math.pow(intervals,2))*aux_a;

    $("#trapezium-mat").append(formula +'<br>');
    $("#trapezium-mat").append(formula2 + '<br>');
    $("#trapezium-mat").append('Result: <br>');
    $("#trapezium-mat").append('The integral between '+a+' to '+b+' of '+f1+' is '+ result + ' with '+error+' of error');

}

function simpson_1_3_0(size, x, y){
    var h = (parseFloat(x[size-1]) - parseFloat(x[0]))/2;
    var aux = parseFloat(y[0]) + parseFloat(y[size-1]) + (4*parseFloat(y[(size-1)/2]));
    var result = (parseFloat(h)*parseFloat(aux))/3;

    $("#simpson-1-3-area").empty();
    $("#simpson-1-3-area").append('Result = '+ result);
}

function simpson_1_3_1(size, x, y){
    var h = parseFloat(x[size-1]) - parseFloat(x[size-2]);
    var sum = parseFloat(y[0]);
    var aux = 0;

    for(var i=1; i<size-1; i+=2){
        aux += parseFloat(y[i]);
    };

    sum += 4*aux;
    aux = 0;

    for(var i=2; i<size-1; i+=2){
        aux += parseFloat(y[i]);
    };

    sum += 2*aux + parseFloat(y[size-1]);

    var result = (parseFloat(sum) * parseFloat(h))/3

    $("#simpson-1-3-area").append('<br>(Widespread) Result = ' + result);
}
function simpson_1_3_2(){
    var f1 = document.getElementById("simpson-1-3-input_f").value;
    var f4 = document.getElementById("simpson-1-3-input_f_4").value;

    var a = parseFloat($("#simpson-1-3-a").val());
    var b = parseFloat($("#simpson-1-3-b").val());

    var intervals = parseFloat($("#simpson-1-3-size").val());

    var h = (b-a)/intervals;

    var sum1 = 0;
    var sum2 = 0;

    var aux_a = 0;
    console.log(f1);

    var result = valueOf_fp({
                "x": a,
                "y": 0
            }, f1);

    console.log(result);

    for(var i = 1; i < intervals; i++){
        aux_a = valueOf_fp({
                "x": a+i*h,
                "y": 0
            }, f1);

        if((i%2) == 0){
            sum1 += aux_a;
        }else if((i%2) ==1 ){
            sum2 += aux_a;
        }
    };

    aux_a = valueOf_fp({
                "x": b,
                "y": 0
            }, f1);

    result += 2*sum1 + 4*sum2 + aux_a;
    result *= (h/3);

    aux_a = valueOf_fp({
                "x": b,
                "y": 0
            }, f4);
    var error = (Math.pow(h,5)/90) * aux_a;

    $("#simpson-1-3-mat").empty();
    $("#simpson-1-3-mat").append('Result: <br>');
    $("#simpson-1-3-mat").append('The integral between '+a+' to '+b+' of '+f1+' is '+ result+' with '+error+' of error');
}

/***********************************************************************************/
function createElement(node, parent, scope, err) {
    switch (node.type) {
        case "FunctionNode":
            node.normalizedType = node.name;
            node.displayAs = node.name;
            break;
        case "OperatorNode":
            node.normalizedType = node.fn;
            node.displayAs = node.op.replace("/", "÷").replace("*", "×");
            break;
        case "ConstantNode":
            node.normalizedType = node.valueType;
            node.displayAs = node.value;
            break;
        case "SymbolNode":
            node.normalizedType = "symbol";
            node.displayAs = node.name;
            break;
        default:
            node.normalizedType = "unknown";
            node.displayAs = node.name;
    }

    try {
        node.answer = node.compile(math).eval(scope);
    } catch (e) {
        err(e);
    }

    var element = document.createElement("span");
    element.classList.add("part");
    element.classList.add(node.normalizedType.toLowerCase());
    element.classList.add(node.type.replace("Node", "").toLowerCase());
    element.setAttribute("title", node.toString() + " = " + node.answer);
    element.setAttribute("normalizedType", node.normalizedType);
    element.setAttribute("nodeType", node.type.replace("Node", "").toLowerCase());
    if ((node.type == "OperatorNode" && (node.fn.indexOf("unary") > -1)) || node.type != "OperatorNode") {
        element.innerHTML = node.displayAs;
    }
    if (parent.tagName) {
        parent.appendChild(element)
    }
    if ((parent.getAttribute("normalizedType") == node.normalizedType) && (node.type.replace("Node", "").toLowerCase() == "operator") && (parent.getAttribute("nodeType") == "operator")) {
        element.classList.add("noBorder");
    }
    if (node.args) {
        node.args.forEach(function(child, i) {
            if (node.type == "OperatorNode") {
                if (((i + 1) % 2) == 0) {
                    element.appendChild(document.createTextNode(node.displayAs));
                }
            }
            createElement(child, element, scope, err);
        });
    }
    node = element;
    return node;
}

function test() {
    var exp = document.getElementById("input").value;
    var scope = JSON.parse(document.getElementById("varibles").value);

    try {
        var to = math.parse(exp);
        console.log(to);
    } catch (err) {
        errorHandler(err);
    }
    var area = document.getElementById("area");
    area.innerHTML = "";

    while (area.firstChild) {
        area.removeChild(area.firstChild);
    }

    createElement(to, area, scope, errorHandler);
    var answer = "ERROR";

    try {
        answer = math.eval(exp, scope);
    } catch (err) {
        errorHandler(err);
    }
    area.appendChild(document.createTextNode(" = " + answer));
}

function valueOf_fp(x, form) {

   var exp = form;

    var scope = x;


    try {
        var to = math.parse(exp);
        console.log(to);
    } catch (err) {
        errorHandler(err);
    }
    /*var area = document.getElementById("trapezium-area");

    while (area.firstChild) {
        area.removeChild(area.firstChild);
    }

    createElement(to, area, scope, errorHandler);
    var answer = "ERROR";*/

    try {
        answer = math.eval(exp, scope);
    } catch (err) {
        errorHandler(err);
    }
    return answer;
}

function valueOf(x) {
    var exp = document.getElementById("input").value;
    var scope = x;

    try {
        var to = math.parse(exp);
        console.log(to);
    } catch (err) {
        errorHandler(err);
    }
    /*var area = document.getElementById("area");

    while (area.firstChild) {
        area.removeChild(area.firstChild);
    }

    createElement(to, area, scope, errorHandler);
    var answer = "ERROR";*/

    try {
        answer = math.eval(exp, scope);
    } catch (err) {
        errorHandler(err);
    }
    return answer;
}

var errorPrev = "";

function errorHandler(err) {
    if (errorPrev.toString() == err.toString()) {
        console.log(errorPrev + " = " + err + "; So BLOCKED");
    } else {
        console.log(errorPrev + " = " + err + "; So ALLOWED");

        while (document.getElementById("error").firstChild) {
            document.getElementById("error").removeChild(document.getElementById("error").firstChild);
        }
        document.getElementById("error").appendChild(document.createTextNode(err));
        errorPrev = err;
    }
}