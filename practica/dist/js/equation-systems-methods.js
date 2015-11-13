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

function array_initialization(size){
    var x = new Array();
    for (var i = 0; i < size; i++) {
        x[i]=0;
    };
    return x;
}
function regressive_replacement(arr){
    var rows = $("#rows").val();

    var f = new Array();
    var x = new Array();
    var sum = 0;

    x = array_initialization(rows);
    f = arr;
    console.log(x);
    
    x[rows-parseFloat(1)] = f[rows][parseFloat(rows)-1]/f[parseFloat(rows)-1][parseFloat(rows)-1];

    console.log(f[parseFloat(rows)-1][parseFloat(rows)-1] +" "+ f[rows][parseFloat(rows)-1]);
    for(var i = parseFloat(rows)-parseFloat(2); i >= 0; i--){
        sum = 0;
        for (var p = i+1; p < rows; p++) {
            sum += parseFloat(f[p][i])*parseFloat(x[p]);
        };
        x[i] =  (parseFloat(f[p][i])-parseFloat(sum))/parseFloat(f[i][i]);  
    };

    $("#area").empty();

    var equ = "[ ";
    for(var i = 0; i < rows; i++){
        equ += " x"+i+": "+x[i];
        if(i != rows-parseFloat(1)){
            equ +=", <br>";
        }
    }
    equ += " ]";
    $("#area").append(equ);

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
                f[j][i] = parseFloat(f[j][i]) - parseFloat(multiplier)*parseFloat(f[j][k]);
            };
        };
    };
    
    mat_out(f);
    regressive_replacement(f);
}