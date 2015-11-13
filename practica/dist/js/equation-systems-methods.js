$(document).ready(function() {

    $("#but").on("click", function(event) {
        var rows = $("#rows").val();
    	var equ = '';

    	$("#matrix").empty();

    	for (var i = 0; i <= rows; i++) {
    		equ ='<div class="col-lg-2" >';

    		for (var j = 0; j < rows; j++) {
    			if(i==rows){
    				equ += '<input class="form-control" style="width=30px; background-color: #286090; color: #fff;" id="matrixi'+i+'j'+j+'" value="'+Math.random()*10+'"><br>';
    			}else{
    				equ += '<input class="form-control" style="width=30px;" id="matrixi'+i+'j'+j+'" value="'+Math.random()*10+'"><br>';
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
    		for (var j = 0; j <= rows; j++) {
    			f[i][j] = $("#matrix"+'i'+i+'j'+j).val();
    		};
    	};
    	return f;
}
function mat_out(f){
    var rows = $("#rows").val();
    var equ = "";

    for (var i = 0; i <= rows; i++) {
        equ ='<div class="col-lg-2" >';
        for (var j = 0; j < rows; j++) {
            if(i == rows){
                equ += '<input class="form-control" style="width=30px; background-color: #286090; color: #fff;" value="'+f[i][j]+'"  id="'+i+'_'+j+'"><br>';
            }else{
                equ += '<input class="form-control" style="width=30px;" value="'+f[i][j]+'"  id="'+i+'_'+j+'"><br>';
            }
        };
       equ += '</div>';
       $("#mat").append(equ);
    };
}


function regressive_replacement(){

}

function simple_gauss(){
    $("#mat").empty();
	var rows = $("#rows").val();
	var f = new Array();
	f = matrixFill();

	var multiplier = 1;

    for (var k = 0; k < parseFloat(rows)-parseFloat(1); k++) {
        for (var i = k+1; i < rows; i++) {
            multiplier = parseFloat(f[k][i])/parseFloat(f[k][k]);   
            for (var j = k; j <= rows; j++) {
                console.log('k '+k+' i '+i +' j '+ j);
                f[j][i] = parseFloat(f[j][i]) - parseFloat(multiplier)*parseFloat(f[j][k]);
                console.log('mult '+multiplier);
                console.log(f[i][j]);
            };
        };
    };
    
    mat_out(f);
}