$(document).ready(function() {

    $("#but").on("click", function(event) {
        var equation = $("#input").val();
        myPlot = new Fooplot(document.getElementById('myPlot'));
        myPlot.addPlot(equation,FOOPLOT_TYPE_FUNCTION);
        //myPlot.addPlot('theta',FOOPLOT_TYPE_POLAR,{'color':'#ff0000'}); 
        myPlot.reDraw();

        test();
        document.getElementById("input").addEventListener("keyup", test);
        document.getElementById("varibles").addEventListener("keyup", test);
    });

    $("#method1").on("click", function(event) {
        
        //Variables
        var delta = $("#delta").val();
        var iterations = $("#iteration").val();
        var sol = document.getElementById("incremental_solution");
        //Matrix
        var incremental_table_x = [];
        var incremental_table_y = [];
        var i = 0;

        if(iterations<=0 || delta==0){
            alert("Las interaciones deben ser mayores a 0 y el delta diferente de 0");
        }else{

            var scope = JSON.parse(document.getElementById("varibles").value);
            
            var x0 = scope.x;
            var y0 = valueOf({"x":x0, "y":0});

            incremental_table_x[i] = x0;
            incremental_table_y[i] = y0;

            if(y0 == 0){
               $("#incremental_solution").text("Root");
            }else{
                var x1 = parseFloat(x0)+parseFloat(delta);
                var y1 = valueOf({"x":x1, "y":0});
                var cont = 1;
                incremental_table_x[cont] = x0;
                incremental_table_y[cont] = y0;

                while( (y0*y1>0) && (y1!=0) && (cont<iterations)){
                    x0 = x1;
                    y0 = y1;
                    x1 = parseFloat(x0)+parseFloat(delta);
                    y1 = valueOf({"x":x1, "y":0});
                    cont++;

                    incremental_table_x[cont] = x0;
                    incremental_table_y[cont] = y0;
                }
                cont++;

                incremental_table_x[cont] = x1;
                incremental_table_y[cont] = y1;
        
                if(y1 == 0){
                   $("#incremental_solution").text("Root");
                }else if( y0*y1 < 0){
                    $('#incremental_table tbody > tr').remove();
                    generateTable(incremental_table_x, incremental_table_y,$('#incremental_table') );
                    $("#incremental_solution").text("Root between x0 = "+ x0 +" and x1 = "+ x1 +".");
                }else{
                    $("#incremental_solution").text("Method fail");
                }
            }
        }

    });
    
});

$("#method2").on("click", function(event) {
    //Auxiliar
    var cont = 0;
    var aux = 0;
    
    var scope = JSON.parse(document.getElementById("varibles").value);
    scope.x = 0;

    var xinf = scope.x;
    var xsup = scope.x;

    //Variables
    var error_abs = 0;
    xinf += parseFloat($("#xinf").val());
    xsup += parseFloat($("#xsup").val());
    var tol = $("#tol").val();
    var iterations = $("#iteration").val();
    var sol = document.getElementById("bisection_solution");

    //y inf and y sup
    var yinf = valueOf({"x":xinf, "y":0});
    var ysup = valueOf({"x":xsup, "y":0});
     
    if( yinf != 0){
        if( ysup != 0){

            if( (yinf*ysup) < 0){
                xm = (parseFloat(xinf) + parseFloat(xsup))/2;
                ym = valueOf({"x":xm, "y":0});
                error_abs = parseFloat(tol) + parseFloat(1);
                cont = 1;
                
                while( (ym!=0) && (error_abs!=tol) && (cont<iterations)){ 

                    if(yinf*ysup < 0){
                        xsup = xm;
                        ysup = valueOf({"x":xsup, "y":0});
                    }else{
                        if(yinf*ym < 0){
                            xinf = xm;
                            yinf = valueOf({"x":xinf, "y":0});
                        }
                    }
                    aux = xm;
                    xm = (parseFloat(xinf) + parseFloat(xsup))/2;
                    error_abs = Math.abs(xm-aux);
                    cont++
                }

                if( (ym == 0) && (error_abs<tol) ){
                     $("#bisection_solution").text("Root");
                }else if(error_abs<tol){
                    $("#bisection_solution").text(xm + " is Root with "+ tol + " of tolerance.");
                }

            }else{
                 $("#bisection_solution").text("Interval error");
            }
        }else{
             $("#bisection_solution").text(xsup + "is Root");
        }
    }else{
        $("#bisection_solution").text(xinf + "is Root");
    }


});
function clearTable(table){
   
}
function generateTable(mat1, mat2, table){
    var $row;
    for (var i =0 ; i < mat1.length ; i++) {
        $row = $row + '<tr><td>'+i+'</td><td>'+mat1[i]+'</td><td>'+mat2[i]+'</td><td>'+ Math.abs(mat2[i]-mat2[i-1]) +'</td></tr>';
    };

    table.append($row);
}

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
      
      try{
        node.answer = node.compile(math).eval(scope);
      } catch(e){
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


    function valueOf(x){
      var exp = document.getElementById("input").value;
      var scope = x;
      
      try {
        var to = math.parse(exp);
        console.log(to);
      } catch (err) {
        errorHandler(err);
      }
      var area = document.getElementById("area");
      
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
      return answer;
    }

    var errorPrev = "";

    function errorHandler(err) {
    if(errorPrev.toString() == err.toString()){console.log(errorPrev + " = " + err + "; So BLOCKED");}else{
      console.log(errorPrev + " = " + err + "; So ALLOWED");
      
      while (document.getElementById("error").firstChild) {
        document.getElementById("error").removeChild(document.getElementById("error").firstChild);
      }
     document.getElementById("error").appendChild(document.createTextNode(err));
     errorPrev = err;
    }
}


