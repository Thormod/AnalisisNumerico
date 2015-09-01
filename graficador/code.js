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

		var scope = JSON.parse(document.getElementById("varibles").value);
		
		var x0 = scope.x;
		var y0 = valueOf({"x":x0, "y":0});

		if(y0 == 0){
			alert("Es raiz");
		}else{
			var x1 = parseFloat(x0)+parseFloat(delta);
			var y1 = valueOf({"x":x1, "y":0});
			var cont = 1;

			while( (y0*y1>0) && (y1!=0) && (cont<iterations)){
				x0 = x1;
				y0 = y1;
				x1 = parseFloat(x0)+parseFloat(delta);
				y1 = valueOf({"x":x1, "y":0});
				cont++;
			}
			if(y1 == 0){
				alert(x1+" es raiz");
			}else if( y0*y1 < 0){
				alert("Raiz entre x0 "+x0+" y x1 "+x1+".");
			}else{
				alert("Fracasó")
			}
		}
	

	});
	
});

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


