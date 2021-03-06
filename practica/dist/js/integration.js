$(document).ready(function() {
    /*
    * nextInput1 ---> trapezium
    * nextInput2 ---> simpson-1-3
    * nextInput3 ---> simpson-3-8
    */
    var nextInput1 = 1;
    var nextInput2 = 1;
    var nextInput3 = 1;

    var prueba = new Array(1,0.718281828,1.1,0.804166024,1.2,0.929116923,1.3,1.069296668,1.4,1.255199967,1.5,1.48168907,1.6,1.753032424,1.7,2.073947392,1.8,2.449647464,1.9,2.885894442,2,3.389056099);
    var prueba2 = new Array(1,2.635802,1.1,2.676796,1.2,2.716208,1.3,2.753612,1.4,2.788694,1.5,2.821241,1.6,2.851123,1.7,2.878282,1.8,2.902721,1.9,2.924491,2,2.943681,2.1,2.960411,2.2,2.974825);

    $("#trapezium-add-point").on("click", function(event) {
        nextInput1 = add_point(nextInput1, "trapezium-control-points", "t");
    });

    $("#simpson-1-3-add-point").on("click", function(event) {
        nextInput2 = add_point(nextInput2, "simpson-1-3-control-points", "s13");
    });

    $("#simpson-3-8-add-point").on("click", function(event) {
        nextInput3 = add_point(nextInput3, "simpson-3-8-control-points", "s38");
    });


    $("#trapezium-erase-point").on("click", function(event){
        nextInput1 = erase_point(nextInput1, "t");
    });
    $("#simpson-1-3-erase-point").on("click", function(event){
        nextInput2 = erase_point(nextInput2, "s13");
    });
    $("#simpson-3-8-erase-point").on("click", function(event){
        nextInput3 = erase_point(nextInput3, "s38");
    });

    //Trapezium method
    $("#method1").on("click", function(event) {
        var arr = new Array();
        var x = new Array();
        var y = new Array();

        arr = fill_array("trapezium", nextInput1);
        //arr = prueba;

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

        arr = fill_array("simpson-1-3", nextInput2);
        //arr = prueba;

        x = divide_array_x(arr);
        y = divide_array_y(arr);

        simpson_1_3_0(arr.length/2, x, y);
        simpson_1_3_1(arr.length/2, x, y);
        simpson_1_3_2();

    });

    //Simpson 3/8 method
    $("#method3").on("click", function(event) {
        var arr = new Array();
        var x = new Array();
        var y = new Array();

        arr = fill_array("simpson-3-8", nextInput2);
        //arr = prueba;

        x = divide_array_x(arr);
        y = divide_array_y(arr);

        simpson_3_8_0(arr.length/2, x, y);
        simpson_3_8_1(arr.length/2, x, y);
        simpson_3_8_2();

    });

    //Differentiation with 2 points
    $("#method4").on("click", function(event) {
        differentiation_2_points();
    });

    //Differentiation with 3 points a
    $("#method5").on("click", function(event) {
        differentiation_3_points_1()
    });

    //Differentiation with 3 points b
    $("#method6").on("click", function(event) {
        differentiation_3_points_2()
    });

    //Differentiation with 3 points c
    $("#method7").on("click", function(event) {
        differentiation_3_points_3()
    });

    //Differentiation with 5 points 
    $("#method8").on("click", function(event) {
        differentiation_5_points()
    });

});

/********************     Buttons functions   ***************************************/

function add_point(nextInput, id, method){
    var equ = '';
    equ += '<div class="row" id='+method+'id'+nextInput+'><div class="col-lg-6"><span>X '+nextInput+':</span><input class="form-control" id="'+method+'x'+nextInput+'"></div><div class="col-lg-6"><span>Y '+nextInput+':</span><input class="form-control" id="'+method+'y'+nextInput+'"></div></div>';

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
    $("#trapezium-mat").append('Function : ' + f1 + ' between ['+a+' , '+b+']. <hr>');

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

    formula = ' h/2 * [ f('+a+') + 2 * ( ';
    formula2 = (h/2) + ' * [ '+aux_a+' + 2 * ( ';

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
    $("#trapezium-mat").append(formula2 + '<hr>');
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

    var formula1 = '';
    var formula2 = '';

    var result = valueOf_fp({
                "x": a,
                "y": 0
            }, f1);

    formula = ' h/3 * [ f('+a+') + 4 * ( ';
    formula2 = (h/3) + ' * [ '+result+' + 2 * ( ';

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

        formula += ' f( '+(a+i*h)+' ) ';
        formula2 += aux_a;

        if(i < intervals-1){
            formula += ' + ';
            formula2 += ' + ';
        }
    };


    aux_a = valueOf_fp({
                "x": b,
                "y": 0
            }, f1);

    formula += ' ) + f('+b+') ]';
    formula2 += ' ) + '+ aux_a+' ]';

    result += 2*sum1 + 4*sum2 + aux_a;
    result *= (h/3);

    aux_a = valueOf_fp({
                "x": b,
                "y": 0
            }, f4);
    var error = (Math.pow(h,5)/90) * aux_a;

    $("#simpson-1-3-mat").empty();
    $("#simpson-1-3-mat").append('Function : ' + f1 + ' between ['+a+' , '+b+'] <hr>');
    $("#simpson-1-3-mat").append(formula +'<br>');
    $("#simpson-1-3-mat").append(formula2 + '<hr>');
    $("#simpson-1-3-mat").append('Result: <br>');
    $("#simpson-1-3-mat").append('The integral between '+a+' to '+b+' of '+f1+' is '+ result+' with '+error+' of error');
}

function simpson_3_8_0(size, x, y){
    var h = (parseFloat(x[size-1]) - parseFloat(x[0]))/3;
    var aux = parseFloat(y[0]) + parseFloat(y[size-1]) + 3*(parseFloat(y[((size-1)/3)*1])+parseFloat(y[((size-1)/3)*2]));
    var result = 3*(parseFloat(h)*parseFloat(aux))/8;

    $("#simpson-3-8-area").empty();
    $("#simpson-3-8-area").append('Result = '+ result);

}
function simpson_3_8_1(size, x, y){
    var h = parseFloat(x[size-1]) - parseFloat(x[size-2]);
    var sum = parseFloat(y[0]);
    var aux = 0;

    for(var i=1; i<size-1; i+=2){
        aux += parseFloat(y[i]);
        console.log(x[i]);
    };

    sum += 2*aux;
    aux = 0;

    for(var i=2; i<size; i+=2){
        aux += parseFloat(y[i]);
        console.log(x[i]);
    };

    sum += 2*aux + parseFloat(y[size-1]);

    var result = 3*(parseFloat(sum) * parseFloat(h))/8

    $("#simpson-3-8-area").append('<br>(Widespread) Result = ' + result);
}
function simpson_3_8_2(){
    var f1 = document.getElementById("simpson-3-8-input_f").value;
    var f4 = document.getElementById("simpson-3-8-input_f_4").value;

    var a = parseFloat($("#simpson-3-8-a").val());
    var b = parseFloat($("#simpson-3-8-b").val());

    var intervals = parseFloat($("#simpson-3-8-size").val());

    var h = (b-a)/intervals;

    var sum1 = 0;
    var sum2 = 0;
    var sum3 = 0;

    var aux_a = 0;

    var formula1 = '';
    var formula2 = '';

    var result = valueOf_fp({
                "x": a,
                "y": 0
            }, f1);

    formula = ' 3 * h/8 * [ f('+a+') + 3 * ( ';
    formula2 = (3*h/8) + ' * [ '+result+' + 3 * ( ';

    for(var i = 1; i < intervals ; i++){
        aux_a = valueOf_fp({
                "x": a+i*h,
                "y": 0
            }, f1);

        if((i%3) == 1){
            sum1 += aux_a;
        }else if((i%3) == 2){
            sum2 += aux_a;
        }else{
            sum3 += aux_a;
        }

        formula += 'f( '+(a+i*h)+' ) ';
        formula2 += aux_a;

        if(i < intervals-1){
            formula += ' + 3 * ';
            formula2 += ' + 3 * ';
        }
    };

    result += 3*sum1;
    result += 3*sum2;
    result += 2*sum3;
    
    aux_a = valueOf_fp({
                "x": b,
                "y": 0
            }, f1);

    formula += ' ) + f('+b+') ]';
    formula2 += ' ) + '+ aux_a+' ]';

    result += aux_a;
    result *= (3*h/8);
    
    aux_a = valueOf_fp({
                "x": b,
                "y": 0
            }, f4);

    var error = (Math.pow(h,5)/90) * aux_a;

    $("#simpson-3-8-mat").empty();
    $("#simpson-3-8-mat").append('Function : ' + f1 + ' between ['+a+' , '+b+'] <hr>');
    $("#simpson-3-8-mat").append(formula +'<br>');
    $("#simpson-3-8-mat").append(formula2 + '<hr>');
    $("#simpson-3-8-mat").append('Result: <br>');
    $("#simpson-3-8-mat").append('The integral between '+a+' to '+b+' of '+f1+' is '+ result+' with '+error+' of error');

}

function differentiation_2_points(){

    var f1 = document.getElementById("dif-2-input_f").value;
    var f2 = document.getElementById("dif-2-input_f_2").value;

    var x0 = parseFloat($("#dif-2-x").val());
    var h = parseFloat($("#dif-2-h").val());
    var zi = parseFloat($("#dif-2-zi").val());

    var aux_a = valueOf_fp({
                "x": x0+h,
                "y": 0
            }, f1);

    var num = aux_a;

    aux_a = valueOf_fp({
                "x": x0,
                "y": 0
            }, f1);

    num -= aux_a;

    num = num/h;

    aux_a = valueOf_fp({
                "x": zi,
                "y": 0
            }, f2);
    var result = num;
    var error = (h/2) * aux_a;

     $("#dif-2-mat").empty();
     $("#dif-2-mat").append('f´(x0) = ( f( x0 + h ) ) / h - h/2 * f´´(zi)<br>');
     $("#dif-2-mat").append('f´('+x0+') = ( f( '+ x0 + h +' ) ) / '+h+' - '+h/2+ ' * '+aux_a+'<hr>');
     $("#dif-2-mat").append('Result: ' +result+' with '+error+' of error');
}

function differentiation_3_points_1(){

    var f1 = document.getElementById("dif-3-1-input_f").value;
    var f3 = document.getElementById("dif-3-1-input_f_3").value;

    var x0 = parseFloat($("#dif-3-1-x").val());
    var h = parseFloat($("#dif-3-1-h").val());
    var zi = parseFloat($("#dif-3-1-zi").val());

    var result = 0;

    var aux_a = valueOf_fp({
                "x": x0-2*h,
                "y": 0
            }, f1);

    result += aux_a;

    aux_a = valueOf_fp({
                "x": x0-h,
                "y": 0
            }, f1);

    result += aux_a * (-4);

    aux_a = valueOf_fp({
                "x": x0,
                "y": 0
            }, f1);

    result += aux_a * 3;

    result *= 1/(2*h);

    aux_a = valueOf_fp({
                "x": zi,
                "y": 0
            }, f3);   

    var error = (Math.pow(h,2)/3)*aux_a;

     $("#dif-3-1-mat").empty();
     $("#dif-3-1-mat").append('f´(x0) = 1/2h * [f(x0 - 2h) - 4 * f(x0 - h) + 3 * f(x0)] + h^2/3 * f´´(zi)<br>');
     $("#dif-3-1-mat").append('f´('+x0+') = '+1/(2*h)+' * [f('+ x0 - 2*h +') - 4 * f('+x0-h+') + 3* f('+x0+')] + '+Math.pow(h,2)/3+' * '+ aux_a+'<hr>');
     $("#dif-3-1-mat").append('Result: ' +result+' with '+error+' of error'); 
}

function differentiation_3_points_2(){

    var f1 = document.getElementById("dif-3-2-input_f").value;
    var f3 = document.getElementById("dif-3-2-input_f_3").value;

    var x0 = parseFloat($("#dif-3-2-x").val());
    var h = parseFloat($("#dif-3-2-h").val());
    var zi = parseFloat($("#dif-3-2-zi").val());

    var result = 0;

    var aux_a = valueOf_fp({
                "x": x0,
                "y": 0
            }, f1);

    result += aux_a * (-3);

    aux_a = valueOf_fp({
                "x": x0+h,
                "y": 0
            }, f1);

    result += aux_a * 4;

    aux_a = valueOf_fp({
                "x": x0+2*h,
                "y": 0
            }, f1);

    result += aux_a * (-1);

    result *= 1/(2*h);

    aux_a = valueOf_fp({
                "x": zi,
                "y": 0
            }, f3);

    var error = (Math.pow(h,2)/3)*aux_a;

    $("#dif-3-2-mat").empty();
    $("#dif-3-2-mat").append('f´(x0) = 1/2h * [-3 * f(x0) + 4 * f(x0+h) - f(x0+2h)] + h^2/3 * f´´´(zi) <br>');
    $("#dif-3-2-mat").append('f´('+x0+') = '+1/(2*h)+' [ -3 * f('+x0+') + 4 * f('+x0+h+') - f('+x0+2*h+')] + '+error+' <hr>');
    $("#dif-3-2-mat").append('Result: ' +result+' with '+error+' of error'); 

}

function differentiation_3_points_3(){

    var f1 = document.getElementById("dif-3-3-input_f").value;
    var f3 = document.getElementById("dif-3-3-input_f_3").value;

    var x0 = parseFloat($("#dif-3-3-x").val());
    var h = parseFloat($("#dif-3-3-h").val());
    var zi = parseFloat($("#dif-3-3-zi").val());

    var result = 0;

    var aux_a = valueOf_fp({
                "x": x0-h,
                "y": 0
            }, f1);

    result += aux_a *(-1);

    aux_a = valueOf_fp({
                "x": x0+h,
                "y": 0
            }, f1);
    result += aux_a;

    aux_a = valueOf_fp({
                "x": zi,
                "y": 0
            }, f3);

    var error = (Math.pow(h,2)/6)*aux_a;

    result *= (1/(2*h));

    $("#dif-3-3-mat").empty();
    $("#dif-3-3-mat").append('f´(x0) = 1/2h * [-f(x0-h) + f(x0+h)] + h^2/6 * f´´´(zi)<br>');
    $("#dif-3-3-mat").append('f´('+x0+') = '+1/(2*h)+' * [-f('+x0+h+')] + '+error+'<hr>');
    $("#dif-3-3-mat").append('Result: ' +result+' with '+error+' of error'); 

}

function differentiation_5_points(){
    var f1 = document.getElementById("dif-5-input_f").value;
    var f5 = document.getElementById("dif-5-input_f_5").value;

    var x0 = parseFloat($("#dif-5-x").val());
    var h = parseFloat($("#dif-5-h").val());
    var zi = parseFloat($("#dif-5-zi").val());

    var result = 0;

    var aux_a = valueOf_fp({
                "x": x0-2*h,
                "y": 0
            }, f1);

    result += aux_a;

    aux_a = valueOf_fp({
                "x": x0-h,
                "y": 0
            }, f1);
    result += aux_a * (-8);

    aux_a = valueOf_fp({
                "x": x0+h,
                "y": 0
            }, f1);
    result += aux_a * 8;

    aux_a = valueOf_fp({
                "x": x0+2*h,
                "y": 0
            }, f1);
    result += aux_a * (-1);

    result = result/(12*h);

    aux_a = valueOf_fp({
                "x": zi,
                "y": 0
            }, f5);

    var error = (Math.pow(h,4)/30) * aux_a;
    
    $("#dif-5-mat").empty();
    $("#dif-5-mat").append('f(x0) = ( f(x0-2h) - 8f(x0-h) + 8f(x0+h) - f(x0+2h) ) / 12h * h^4/30 * f´5´(zi) <br>');
    $("#dif-5-mat").append('f('+x0+') = ( f('+(x0-2*h)+') - 8f('+x0+h+') - f('+x0+2*h+') ) / '+12*h+' * '+error+' <hr>');
    $("#dif-5-mat").append('Result: ' +result+' with '+error+' of error'); 
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