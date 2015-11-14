$(document).ready(function() {
    /*
    * nextInput1 ---> equations
    * nextInput2 ---> newton
    * nextInput3 ---> lagrage
    */
	var nextInput1 = 1;
    var nextInput2 = 1;
    var nextInput3 = 1;

    $("#equations-add-point").on("click", function(event) {
    	nextInput1 = add_point(nextInput1, "equations-control-points", "e");
    });

    $("#newton-add-point").on("click", function(event){
        nextInput2 = add_point(nextInput2, "newton-control-points", "n");
    });

     $("#lagrange-add-point").on("click", function(event) {
        nextInput3 = add_point(nextInput3, "lagrange-control-points", "l");
    });

    $("#equations-erase-point").on("click", function(event){
        nextInput1 = erase_point(nextInput1, "e");
    });
    
    $("#newton-erase-point").on("click", function(event){
        nextInput2 = erase_point(nextInput2, "n");
    });

    $("#lagrange-erase-point").on("click", function(event){
        nextInput3 = erase_point(nextInput3, "l");
    });

    $("#method1").on("click", function(event) {
    	var arr = new Array();
    	var x = new Array();
    	var y = new Array();

    	arr = fill_array("equation_systems", nextInput1);

    	x = divide_array_x(arr);
    	y = divide_array_y(arr);

    	vandermonde_matrix(x,y,"equations");
    });

    $("#method2").on("click", function(event) {
        var arr = new Array();
        var x = new Array();
        var y = new Array();

        arr = fill_array("newton", nextInput2);

        x = divide_array_x(arr);
        y = divide_array_y(arr);

        vandermonde_matrix(x,y,"newton");
    });

     $("#method3").on("click", function(event) {
        var arr = new Array();
        var x = new Array();
        var y = new Array();

        arr = fill_array("lagrange", nextInput2);

        x = divide_array_x(arr);
        y = divide_array_y(arr);

        vandermonde_matrix(x,y,"lagrange");
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

function mat_imp(f){
    var equ = '';
    for (var i = 0; i < f.length; i++) {
        for (var j = 0; j < f.length-1; j++) {
            equ += f[i][j] + ' i ' + i + ' j ' + j + ' ';
        };
        console.log(equ);
        equ = '';
    };
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

function array_initialization(size){
    var x = new Array();
    for (var i = 0; i < size; i++) {
        x[i]=0;
    };
    return x;
}
function regressive_replacement(arr, method){
    var rows = arr.length-1;

    var f = new Array();
    var x = new Array();
    var sum = 0;

    x = array_initialization(rows);

    f = arr;
   
    x[rows-1] = f[parseFloat(rows)-1][rows]/f[parseFloat(rows)-1][parseFloat(rows)-1];

    for(var i = parseFloat(rows)-parseFloat(1); i >= 0; i--){
        sum = 0;
        for (var p = i+1; p < rows; p++) {
            sum += parseFloat(f[p][i])*parseFloat(x[p]);
        };
        x[i] =  (parseFloat(f[p][i])-parseFloat(sum))/parseFloat(f[i][i]); 
    };

    $("#"+method+"-area").empty();

    var equ = "[ ";
    for(var i = 0; i < rows; i++){
        equ += " x"+i+": "+x[i];
        if(i != rows-parseFloat(1)){
            equ +=", <br>";
        }
    }
    equ += " ]";
    $("#"+method+"-area").append(equ);

}

function simple_gauss(size, method){

    var rows = parseFloat(size);
    var f = new Array();
    f = matrixFill(rows);
    
    
    var multiplier = 1;

    for (var k = 0; k < parseFloat(rows)-parseFloat(1); k++) {
        for (var i = k+1; i < rows; i++) {
            multiplier = parseFloat(f[k][i])/parseFloat(f[k][k]);   
            for (var j = k; j <= rows; j++) {
                f[j][i] = parseFloat(f[j][i]) - parseFloat(multiplier)*parseFloat(f[j][k]);
            };
        };
    };
    
    regressive_replacement(f, method);
}

/****************************************************************/
function mat_out(arr, method){
	$("#"+method+"-mat").empty();
	
    var rows =arr.length;
    var equ = "";

    for (var i = 0; i <= rows; i++) {
        equ ='<div class="col-lg-2" >';
        for (var j = 0; j < rows; j++) {
            if(i == rows){
                equ += '<input class="form-control" style="width=30px; background-color: #286090; color: #fff;" value="'+arr[j][i]+'"  id="matrixi'+i+'j'+j+'"><br>';
            }else{
                equ += '<input class="form-control" style="width=30px;" value="'+arr[j][i]+'"  id="matrixi'+i+'j'+j+'"><br>';
            }
        };
       equ += '</div>';
       $("#"+method+"-mat").append(equ);
    };
}

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
	if(method == "equation_systems"){
		id = "equations-control-points";
	}else if(method == "newton"){
        id = "newton-control-points";
    }else if(method == "lagrange"){
        id = "lagrange-control-points"; 
    }

	$("#"+id+" input").each(function(){
        arr[length] = $(this).val();
		length++;
	})
	return arr;
}

function vandermonde_matrix(x, y, method){
	var res = new Array();
	var cont = 0;

	for (var i = x.length-1; i >= 0; i--) {
		res[i] = new Array();
		cont=0;
		for (var j = x.length-1; j >= 0 ; j--) {
			res[i][cont] = Math.pow(x[i],j);
			cont++;
		};
	};

	for (var i = 0; i < res.length; i++) {
		res[i][res.length] = parseFloat(y[i]);
	};

    mat_out(res, method);
    simple_gauss(res.length, method);
}



function equation_systems_based_method(){

}