$(document).ready(function() {

    $("#but").on("click", function(event) {
        var rows = $("#rows").val();
    	var equ = '';

    	$("#matrix").empty();

    	for (var i = 0; i <= rows; i++) {
    		equ ='<div class="col-lg-2" >';

    		for (var j = 0; j < rows; j++) {
    			if(i==rows){
    				equ += '<input class="form-control" style="width=30px; background-color: #3530f2; color: #fff;" id="matrixi'+i+'j'+j+'" value="'+Math.random()+'"><br>';
    			}else{
    				equ += '<input class="form-control" style="width=30px;" id="matrixi'+i+'j'+j+'" value="'+Math.random()+'"><br>';
    			}
    		};
    		equ += '</div>';
    		$("#matrix").append(equ);
    	};

    });

    $("#simple-gauss").on("click",function(event){
    	simple_gauss();
    });
});

 function matrixFill(){
 		var rows = $("#rows").val();
    	var f = new Array();
    	for (var i = 0; i <= rows; i++) {
    		f[i] = new Array();
    		for (var j = 0; j < rows; j++) {
    			f[i][j] = $("#matrix"+'i'+i+'j'+j).val();
    		};
    	};
    	return f;
}
function regressive_replacement(){

}

function simple_gauss(){

	var rows = $("#rows").val();
	var f = new Array();
	f = matrixFill();
	var multiplier = 1;
	for (var k = 0; k < rows-1 ; k++) {
		for (var i = k+1; i < rows ; i++) {
			multplier = parseFloat(f[i][k])/parseFloat(f[k][k]);
			for(var j = k; i <= rows ; i++){
				f[i][j] = f[i][j] - parseFloat(multiplier) * parseFloat(f[k][j]);
			};
		};
	};

	for (var i = 0; i <= rows; i++) {
    	

    		for (var j = 0; j < rows; j++) {
    			console.log(f[i][j]);
    		};
    	};

}