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

    //Incremental search method
    $("#method1").on("click", function(event) {
        
        //Variables
        var delta = $("#delta").val();
        var iterations = $("#iteration").val();
        var sol = document.getElementById("incremental_solution");
        
        //Matrix
        var incremental_table_x = [];
        var incremental_table_y = [];

        if(iterations<=0 || delta==0){
            alert("Las interaciones deben ser mayores a 0 y el delta diferente de 0");
        }else{

            var scope = JSON.parse(document.getElementById("varibles").value);
            
            var x0 = scope.x;
            var y0 = valueOf({"x":x0, "y":0});

            incremental_table_x[0] = x0;
            incremental_table_y[0] = y0;

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
                    //Erase the table content
                    $('#incremental_table tbody > tr').remove();
                    //Genearate the table
                    generateTable(incremental_table_x, incremental_table_y,$('#incremental_table'),"incremental" );
                    $("#incremental_solution").text("Root between x0 = "+ x0 +" and x1 = "+ x1 +".");
                }else{
                    $("#incremental_solution").text("Method fail");
                }
            }
        }

    });
    
});

//Bisection method
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
    var tol = parseFloat($("#tol").val());
    var iterations = $("#iteration_b").val();
    var sol = document.getElementById("bisection_solution");

    //y inf and y sup
    var yinf = valueOf({"x":xinf, "y":0});
    var ysup = valueOf({"x":xsup, "y":0});
        
    //Matrix
    var bisection_table_xinf = [];
    var bisection_table_xsup = [];

    bisection_table_xinf[0] = xinf;
    bisection_table_xsup[0] = xsup;

    if( yinf != 0){
        if( ysup != 0){

            if( (yinf*ysup) < 0){
                xm = (parseFloat(xinf) + parseFloat(xsup))/2;
                ym = valueOf({"x":xm, "y":0});
                error_abs = parseFloat(tol) + parseFloat(1);
                cont = 1;
                
                while( (ym!=0) && (error_abs > tol) && (cont<iterations)){ 

                    if(yinf*ym < 0){
                        xsup = xm;
                        ysup = valueOf({"x":xsup, "y":0});
                    }else if(yinf*ym > 0){
                        xinf = xm;
                        yinf = valueOf({"x":xinf, "y":0});                    
                    }

                    aux = xm;
                    xm = (parseFloat(xinf) + parseFloat(xsup))/2;
                    ym = valueOf({"x":xm, "y":0});
                    error_abs = Math.abs(parseFloat(xm)-parseFloat(aux));

                    bisection_table_xinf[cont] = xinf;
                    bisection_table_xsup[cont] = xsup;

                    cont++
                }

                //Erase the table content
                $('#bisection_table tbody > tr').remove();
                //Genearate the table
                generateTable(bisection_table_xinf, bisection_table_xsup,$('#bisection_table'),"bisection" );

                if((ym == 0)){
                    $("#bisection_solution").text("Root");
                }else if(error_abs<tol){
                    $("#bisection_solution").text(xm + " is Root with "+ tol + " of tolerance.");
                }else{
                    $("#bisection_solution").text("Iterations error");
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

//False rule method
$("#method3").on("click", function(event) {
   //Auxiliar
    var cont = 0;
    var aux = 0;
    
    var scope = JSON.parse(document.getElementById("varibles").value);
    scope.x = 0;

    var xinf = scope.x;
    var xsup = scope.x;

    //Variables
    var error_abs = 0;
    xinf += parseFloat($("#xinf_f").val());
    xsup += parseFloat($("#xsup_f").val());
    var tol = parseFloat($("#tol_f").val());
    var iterations = $("#iteration_f").val();
    var sol = document.getElementById("false_solution");

    //y inf and y sup
    var yinf = valueOf({"x":xinf, "y":0});
    var ysup = valueOf({"x":xsup, "y":0});
        
    //Matrix
    var false_table_xinf = [];
    var false_table_xsup = [];

    false_table_xinf[0] = xinf;
    false_table_xsup[0] = xsup;

    if( yinf != 0){
        if( ysup != 0){

            if( (yinf*ysup) < 0){
                //In this method they change the way of the xm evaluation xi - [(f(xi)(xs-xi))/(f(xs)-f(xi))]
                //xm = (parseFloat(xinf) + parseFloat(xsup))/2;
                xm = parseFloat(xinf) - ( (yinf*(parseFloat(xsup)-parseFloat(xinf))) /(ysup-yinf))
                ym = valueOf({"x":xm, "y":0});
                error_abs = parseFloat(tol) + parseFloat(1);
                cont = 1;
                
                while( (ym!=0) && (error_abs > tol) && (cont<iterations)){ 

                    if(yinf*ym < 0){
                        xsup = xm;
                        ysup = valueOf({"x":xsup, "y":0});
                    }else if(yinf*ym > 0){
                        xinf = xm;
                        yinf = valueOf({"x":xinf, "y":0});                    
                    }

                    aux = xm;
                    xm = parseFloat(xinf) - ( (yinf*(parseFloat(xsup)-parseFloat(xinf))) /(ysup-yinf))
                    ym = valueOf({"x":xm, "y":0});
                    error_abs = Math.abs(xm-aux);

                    false_table_xinf[cont] = xinf;
                    false_table_xsup[cont] = xsup;

                    cont++
                }


                //Erase the table content
                $('#false_table tbody > tr').remove();
                //Genearate the table
                generateTable(false_table_xinf, false_table_xsup,$('#false_table'),"bisection" );

                if((ym == 0)){
                    $("#false_solution").text("Root");
                }else if(error_abs<tol){
                    $("#false_solution").text(xm + " is Root with "+ tol + " of tolerance.");
                }else{
                    $("#false_solution").text("Iterations error");
                }

            }else{
                 $("#false_solution").text("Interval error");
            }
        }else{
             $("#false_solution").text(xsup + "is Root");
        }
    }else{
        $("#false_solution").text(xinf + "is Root");
    }
});

//Fixed Point method
$("#method4").on("click", function(event) {
    
    var scope = JSON.parse(document.getElementById("varibles").value);
    scope.x = 0;
    
    var xa = scope.x;
    var xn = 0;
    var tol = parseFloat($("#tol_fp").val());
    
    xa += parseFloat($("#xnumber").val());
    var iter = $("#iteration_fp").val();
    var error_abs = parseFloat(tol) + parseFloat(1);
    var cont = 0;

    //Matrix
    var fixed_table_x = [];
    var fixed_table_y = [];

    var fxa = valueOf({"x":xa, "y":0});

    fixed_table_x[cont] = xa;
    fixed_table_y[cont] = fxa;

    var aux = 0;
    while( (fxa != 0) && (error_abs > tol) && (cont < iter)){
        aux = xn;
        xn = valueOf_fp({"x":xa, "y":0},"fixed");
        fxa = valueOf({"x":xn, "y":0});

        error_abs = Math.abs( (parseFloat(xn)-parseFloat(aux))/parseFloat(xn) );
        //error_abs = Math.abs( (parseFloat(xn)-parseFloat(fxa))/parseFloat(xn) );
        xa = xn;
        cont++

        fixed_table_x[cont] = xn;
        fixed_table_y[cont] = error_abs;
    }

    if( fxa == 0){
      $("#fixed_point_solution").text(xa + " is Root");
    }else if(error_abs < tol){
      $("#fixed_point_solution").text(xa + " is near a Root with "+ tol +" of tolerance");
    }else{
      $("#fixed_point_solution").text("Method fail");
    }

    //Erase the table content
    $('#fixed_point_table tbody > tr').remove();
    //Genearate the table
    generateTable(fixed_table_x, fixed_table_y,$('#fixed_point_table'),"fixed" );
});

$("#method5").on("click", function(event) {
  var tol =  parseFloat($("#tol_n").val());
  
  var scope = JSON.parse(document.getElementById("varibles").value);
  scope.x = 0;

  var x0 = scope.x;
  var x1 = 0;

  x0 += parseFloat($("#xnumber_n").val());
  var iter = $("#iteration_n").val();
  var error_abs =  parseFloat(tol) + parseFloat(1);
  var cont = 0;

  var fx = valueOf({"x":x0, "y":0});
  var dfx = valueOf_fp({"x":x0, "y":0}, "newton");

  //Matrix
  var fixed_table_x = [];
  var fixed_table_y = [];
  
  fixed_table_x[cont] = x0;

  alert("x0 " + x0 + " fx " + fx + " dfx " + dfx);
  alert(parseFloat(x0) - (parseFloat(fx)/parseFloat(dfx)));
  while( (error_abs > tol) && (fx != 0) && (dfx != 0) && (cont < iter)){

    x1 = parseFloat(x0)- (parseFloat(fx)/parseFloat(dfx));
    fx = valueOf({"x":x1, "y":0});
    dfx = valueOf_fp({"x":x1, "y":0},"newton");
    error_abs = Math.abs(parseFloat(x1)-parseFloat(x0));
    x0 = x1;
    cont++;

    fixed_table_x[cont] = x1;
  }
  if(fx == 0){
    $("#newton_solution").text(x0 + " is Root");
  }else if(error_abs < tol){
    $("#newton_solution").text(x0 + " is near a Root with "+ tol +" of tolerance");
  }else if(dfx == 0){
    $("#newton_solution").text(x1 + " can be a multiple Root");
  }else{
    $("#newton_solution").text("Method fail with " + iter + " iterations");
  }

  //Erase the table content
  $('#newton_table tbody > tr').remove();
  //Genearate the table
  generateTable(fixed_table_x, fixed_table_y,$('#newton_table'),"newton" );

});

$("#method6").on("click", function(event) {
  var iter = $("#iteration_s").val();
  var tol =  parseFloat($("#tol_s").val());
  
  var scope = JSON.parse(document.getElementById("varibles").value);
  scope.x = 0;

  var x0 = scope.x;
  var x1 = scope.x;
  var x2 = scope.x;

  x0 += parseFloat($("#x0_s").val());
  x1 += parseFloat($("#x1_s").val());

  var fx0 = valueOf({"x":x0, "y":0});
  var fx1 = 0;

  //Matrix
  var secant_table_X = [];
  var secant_table_y = [];

  var i = 0;
  secant_table_X[i] = x0;
  i++;
  secant_table_X[i] = x1;
  i++;

  if( fx0 == 0 ){
    $("#secant_solution").text(x0 + " is Root");
  }else{
    fx1 = valueOf({"x":x1, "y":0});
    var cont = 0;
    var error_abs = parseFloat(tol) + parseFloat(1);
    var den = parseFloat(fx1) - parseFloat(fx0);

    while( (error_abs > tol) && (fx1 != 0) && (den != 0) && (cont < iter) ){
        x2 = parseFloat(x1) - ( fx1*(parseFloat(x1)-parseFloat(x0))/parseFloat(den) );
        error_abs = Math.abs(parseFloat(x2)-parseFloat(x1));
        x0 = x1;
        fx0 = fx1;
        x1 = x2;

        fx1 = valueOf({"x":x1, "y":0});
        den = parseFloat(fx1) - parseFloat(fx0);
        
        secant_table_X[i] = x2;
        i++;
        
        cont++;    
    }

    if(fx1 == 0){
      $("#secant_solution").text(x1 + " is Root");
    }else if( error_abs < tol){
      $("#secant_solution").text(x0 + " is near a Root with "+ tol + " of tolerance");     
    }else if(den == 0){
      $("#secant_solution").text("Multiple Root");
    }else{
      $("#secant_solution").text("Method failed with " +iter+ " iterations");
    }
  }

  //Erase the table content
  $('#secant_table tbody > tr').remove();
  //Genearate the table
  generateTable(secant_table_X, secant_table_y,$('#secant_table'),"secant" );

});
function generateTable(mat1, mat2, table, method){
    //Row initialization
    var $row;
    if(method == "incremental"){
      for (var i =0 ; i < mat1.length ; i++) {
          $row = $row + '<tr><td>'+i+'</td><td>'+mat1[i]+'</td><td>'+mat2[i]+'</td><td>'+ Math.abs(parseFloat(mat2[i])-parseFloat(mat2[i-1])) +'</td></tr>';
      };
    }
    //i, xinf, xsup, xm, f(xm), error
    if(method == "bisection"){
      var xm = 0;
      var aux = 0;

      for (var i =0 ; i < mat1.length ; i++) {
          xm = (parseFloat(mat1[i]) + parseFloat(mat2[i]))/2;
          ym = valueOf({"x":xm, "y":0});
          $row = $row + '<tr><td>'+i+'</td><td>'+mat1[i]+'</td><td>'+mat2[i]+'</td><td>'+ xm +'</td><td>'+ ym +'</td><td>'+ Math.abs(parseFloat(aux)-parseFloat(ym)) +'</td></tr>';
          aux = ym;
      };
    }
    if(method == "fixed"){
      for (var i =0 ; i < mat1.length ; i++) {
          $row = $row + '<tr><td>'+i+'</td><td>'+mat1[i]+'</td><td>'+valueOf({"x":mat1[i], "y":0})+'</td><td>'+mat2[i] +'</td></tr>';
      };
    }
    //x, fx, f'x, error
    if(method == "newton"){
      var fx = 0;
      var dfx = 0;
      for (var i =0 ; i < mat1.length ; i++) {
          fx = valueOf({"x":parseFloat(mat1[i]), "y":0});
          dfx = valueOf_fp({"x":parseFloat(mat1[i]), "y":0},"newton");
          $row = $row + '<tr><td>'+i+'</td><td>'+mat1[i]+'</td><td>'+fx+'</td><td>'+dfx+'</td><td>'+ Math.abs(parseFloat(mat1[i])-parseFloat(mat1[i-1])) +'</td></tr>';
      };
    }
    //x, f(x), error
    if(method == "secant"){
      for (var i =0 ; i < mat1.length ; i++) {
          fx = valueOf({"x":parseFloat(mat1[i]), "y":0});
          $row = $row + '<tr><td>'+i+'</td><td>'+mat1[i]+'</td><td>'+fx+'</td><td>'+ Math.abs(parseFloat(mat1[i])-parseFloat(mat1[i-1])) +'</td></tr>';
      };
    }
    //Table append
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

    function valueOf_fp(x, input){

      if(input == "fixed"){
        var exp = document.getElementById("input_f").value;
      }else if(input == "newton"){
        var exp = document.getElementById("input_n").value;
      }
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


