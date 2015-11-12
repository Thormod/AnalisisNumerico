$(document).ready(function() {

    $("#but").on("click", function(event) {
        var equation = $("#input").val();
        
        //myPlot = new Fooplot(document.getElementById('myPlot'));
        //myPlot.addPlot(equation, FOOPLOT_TYPE_FUNCTION);
        //myPlot.addPlot('theta',FOOPLOT_TYPE_POLAR,{'color':'#ff0000'}); 
        //myPlot.reDraw();

        test();
        document.getElementById("input").addEventListener("keyup", test);
        document.getElementById("varibles").addEventListener("keyup", test);
    });

    /******************************************************************************************
     **********************           INCREMENTAL SEARCH          ******************************
     *******************************************************************************************/

    $("#method1").on("click", function(event) {

        /**************     Variables declaration    *****************************/
        
        //We use the scope to copy the variable type
        var scope = JSON.parse(document.getElementById("varibles").value);
        scope.x = 0;

        //Inputs
        var x0 = scope.x;
        x0 += parseFloat($("#x").val());
        var delta = $("#delta").val();
        var iterations = $("#iteration").val();
        var sol = document.getElementById("incremental_solution");

        //Matrix
        var incremental_table_x = [];
        var incremental_table_y = [];
        /**************     /Variables declaration    ****************************/

        /**********************     Method logic    ******************************/
        if (iterations <= 0 || delta == 0) {
            alert("Las interaciones deben ser mayores a 0 y el delta diferente de 0");
        } else {

            var scope = JSON.parse(document.getElementById("varibles").value);

            var x0 = scope.x;
            var y0 = valueOf({
                "x": x0,
                "y": 0
            });

            incremental_table_x[0] = x0;
            incremental_table_y[0] = y0;

            if (y0 == 0) {
                $("#incremental_solution").text("Root");
            } else {
                var x1 = parseFloat(x0) + parseFloat(delta);
                var y1 = valueOf({
                    "x": x1,
                    "y": 0
                });
                var cont = 1;
                incremental_table_x[cont] = x0;
                incremental_table_y[cont] = y0;

                while ((y0 * y1 > 0) && (y1 != 0) && (cont < iterations)) {
                    x0 = x1;
                    y0 = y1;
                    x1 = parseFloat(x0) + parseFloat(delta);
                    y1 = valueOf({
                        "x": x1,
                        "y": 0
                    });
                    cont++;

                    incremental_table_x[cont] = x0;
                    incremental_table_y[cont] = y0;
                }
                cont++;

                incremental_table_x[cont] = x1;
                incremental_table_y[cont] = y1;

                if (y1 == 0) {
                    $("#incremental_solution").text("Root");
                } else if (y0 * y1 < 0) {
                    //Erase the table content
                    $('#incremental_table tbody > tr').remove();
                    //Genearate the table
                    generateTable(incremental_table_x, incremental_table_y, $('#incremental_table'), "incremental", delta.length-2);
                    $("#incremental_solution").text("Root between x0 = " 
                        + parseFloat(x0) + 
                        " and x1 = " 
                        + parseFloat(x1) 
                    + ".");

                } else {
                    $("#incremental_solution").text("Method fail");
                }
            }
        }

    });
    /**********************     /Method logic    ******************************/

});

/******************************************************************************************
 *************************            BISECTION            ********************************
 *******************************************************************************************/

$("#method2").on("click", function(event) {

    /**************     Variables declaration    *****************************/
    //Auxiliar
    var cont = 0;
    var aux = 0;

    //We use the scope to copy the variable type
    var scope = JSON.parse(document.getElementById("varibles").value);
    scope.x = 0;

    //X inputs
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
    var yinf = valueOf({
        "x": xinf,
        "y": 0
    });
    var ysup = valueOf({
        "x": xsup,
        "y": 0
    });

    //Matrix
    var bisection_table_xinf = [];
    var bisection_table_xsup = [];

    //Matrix declaration
    bisection_table_xinf[0] = xinf;
    bisection_table_xsup[0] = xsup;

    /**************     /Variables declaration    ****************************/

    /**********************     Method logic    ******************************/
    if (yinf != 0) {
        if (ysup != 0) {

            if ((yinf * ysup) < 0) {
                xm = (parseFloat(xinf) + parseFloat(xsup)) / 2;
                ym = valueOf({
                    "x": xm,
                    "y": 0
                });
                error_abs = parseFloat(tol) + parseFloat(1);
                cont = 1;

                while ((ym != 0) && (error_abs > tol) && (cont < iterations)) {

                    if (yinf * ym < 0) {
                        xsup = xm;
                        ysup = valueOf({
                            "x": xsup,
                            "y": 0
                        });
                    } else if (yinf * ym > 0) {
                        xinf = xm;
                        yinf = valueOf({
                            "x": xinf,
                            "y": 0
                        });
                    }

                    aux = xm;
                    xm = (parseFloat(xinf) + parseFloat(xsup)) / 2;
                    ym = valueOf({
                        "x": xm,
                        "y": 0
                    });
                    error_abs = Math.abs(parseFloat(xm) - parseFloat(aux));

                    bisection_table_xinf[cont] = xinf;
                    bisection_table_xsup[cont] = xsup;

                    cont++
                }

                //Erase the table content
                $('#bisection_table tbody > tr').remove();
                //Genearate the table
                generateTable(bisection_table_xinf, bisection_table_xsup, $('#bisection_table'), "bisection", $("#tol").val().length-2);

                if ((ym == 0)) {
                    $("#bisection_solution").text("Root");
                } else if (error_abs < tol) {
                    
                    $("#bisection_solution").text(
                          parseFloat(xm).toFixed($("#tol").val().length-2) + " is Root with " 
                        + tol + " of tolerance.");
                } else {
                    $("#bisection_solution").text("Iterations error");
                }

            } else {
                $("#bisection_solution").text("Interval error");
            }
        } else {
            $("#bisection_solution").text(xsup + "is Root");
        }
    } else {
        $("#bisection_solution").text(xinf + "is Root");
    }
    /**********************     /Method logic    *****************************/
});

/******************************************************************************************
 **********************           FALSE RULE METHOD           ******************************
 *******************************************************************************************/

$("#method3").on("click", function(event) {
    /**************     Variables declaration    *****************************/
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
    var yinf = valueOf({
        "x": xinf,
        "y": 0
    });
    var ysup = valueOf({
        "x": xsup,
        "y": 0
    });

    //Matrix
    var false_table_xinf = [];
    var false_table_xsup = [];

    false_table_xinf[0] = xinf;
    false_table_xsup[0] = xsup;

    /**************     /Variables declaration    ****************************/

    /**********************     Method logic    ******************************/
    if (yinf != 0) {
        if (ysup != 0) {

            if ((yinf * ysup) < 0) {
                //In this method they change the way of the xm evaluation xi - [(f(xi)(xs-xi))/(f(xs)-f(xi))]
                //xm = (parseFloat(xinf) + parseFloat(xsup))/2;
                xm = parseFloat(xinf) - ((yinf * (parseFloat(xsup) - parseFloat(xinf))) / (ysup - yinf))
                ym = valueOf({
                    "x": xm,
                    "y": 0
                });
                error_abs = parseFloat(tol) + parseFloat(1);
                cont = 1;

                while ((ym != 0) && (error_abs > tol) && (cont < iterations)) {

                    if (yinf * ym < 0) {
                        xsup = xm;
                        ysup = valueOf({
                            "x": xsup,
                            "y": 0
                        });
                    } else if (yinf * ym > 0) {
                        xinf = xm;
                        yinf = valueOf({
                            "x": xinf,
                            "y": 0
                        });
                    }

                    aux = xm;
                    xm = parseFloat(xinf) - ((yinf * (parseFloat(xsup) - parseFloat(xinf))) / (ysup - yinf))
                    ym = valueOf({
                        "x": xm,
                        "y": 0
                    });
                    error_abs = Math.abs(xm - aux);

                    false_table_xinf[cont] = xinf;
                    false_table_xsup[cont] = xsup;

                    cont++
                }


                //Erase the table content
                $('#false_table tbody > tr').remove();
                //Genearate the table
                generateTable(false_table_xinf, false_table_xsup, $('#false_table'), "bisection", $("#tol_f").val().length-2);

                if ((ym == 0)) {
                    $("#false_solution").text("Root");
                } else if (error_abs < tol) {
                    $("#false_solution").text(parseFloat(xm).toFixed($("#tol_f").val().length-2) + " is Root with " 
                                            + tol + " of tolerance.");
                } else {
                    $("#false_solution").text("Iterations error");
                }

            } else {
                $("#false_solution").text("Interval error");
            }
        } else {
            $("#false_solution").text(xsup + "is Root");
        }
    } else {
        $("#false_solution").text(xinf + "is Root");
    }
    /**********************     /Method logic    *****************************/
});

/******************************************************************************************
 **********************           FIXED POINT METHOD          ******************************
 *******************************************************************************************/

$("#method4").on("click", function(event) {

    /**************     Variables declaration    *****************************/
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

    var fxa = valueOf({
        "x": xa,
        "y": 0
    });

    fixed_table_x[cont] = xa;
    fixed_table_y[cont] = fxa;

    var aux = 0;

    /**************     /Variables declaration    ****************************/

    /**********************     Method logic    ******************************/
    while ((fxa != 0) && (error_abs > tol) && (cont < iter)) {
        aux = xn;
        xn = valueOf_fp({
            "x": xa,
            "y": 0
        }, "fixed");
        fxa = valueOf({
            "x": xn,
            "y": 0
        });

        error_abs = Math.abs((parseFloat(xn) - parseFloat(aux)) / parseFloat(xn));
        //error_abs = Math.abs( (parseFloat(xn)-parseFloat(fxa))/parseFloat(xn) );
        xa = xn;
        cont++

        fixed_table_x[cont] = xn;
        fixed_table_y[cont] = error_abs;
    }

    if (fxa == 0) {
        $("#fixed_point_solution").text(xa + " is Root");
    } else if (error_abs < tol) {
        $("#fixed_point_solution").text(parseFloat(xa).toFixed($("#tol_fp").val().length-2) + " is near a Root with " 
                                        + tol + " of tolerance");
    } else {
        $("#fixed_point_solution").text("Method fail");
    }

    //Erase the table content
    $('#fixed_point_table tbody > tr').remove();
    //Genearate the table
    generateTable(fixed_table_x, fixed_table_y, $('#fixed_point_table'), "fixed", $("#tol_fp").val().length-2);

    /**********************     Method logic    ******************************/
});

/******************************************************************************************
 ************************           NEWTON METHOD           ********************************
 *******************************************************************************************/

$("#method5").on("click", function(event) {

    /**************     Variables declaration    *****************************/
    var tol = parseFloat($("#tol_n").val());

    var scope = JSON.parse(document.getElementById("varibles").value);
    scope.x = 0;

    var x0 = scope.x;
    var x1 = 0;

    x0 += parseFloat($("#xnumber_n").val());
    var iter = $("#iteration_n").val();
    var error_abs = parseFloat(tol) + parseFloat(1);
    var cont = 0;

    var fx = valueOf({
        "x": x0,
        "y": 0
    });
    var dfx = valueOf_fp({
        "x": x0,
        "y": 0
    }, "newton");

    //Matrix
    var fixed_table_x = [];
    var fixed_table_y = [];

    fixed_table_x[cont] = x0;

    /**************     /Variables declaration    ****************************/

    /**********************     Method logic    ******************************/
    while ((error_abs > tol) && (fx != 0) && (dfx != 0) && (cont < iter)) {

        x1 = parseFloat(x0) - (parseFloat(fx) / parseFloat(dfx));
        fx = valueOf({
            "x": x1,
            "y": 0
        });
        dfx = valueOf_fp({
            "x": x1,
            "y": 0
        }, "newton");
        error_abs = Math.abs(parseFloat(x1) - parseFloat(x0));
        x0 = x1;
        cont++;

        fixed_table_x[cont] = x1;
    }
    if (fx == 0) {
        $("#newton_solution").text(parseFloat(xo).toFixed($("#tol_n").val().length-2) + " is Root");
    } else if (error_abs < tol) {
        $("#newton_solution").text(parseFloat(x0).toFixed($("#tol_n").val().length-2) + " is near a Root with " 
                                    + tol + " of tolerance");
    } else if (dfx == 0) {
        $("#newton_solution").text(parseFloat(x1).toFixed($("#tol_fp").val().length-2) + " can be a multiple Root");
    } else {
        $("#newton_solution").text("Method fail with " + iter + " iterations");
    }

    //Erase the table content
    $('#newton_table tbody > tr').remove();
    //Genearate the table
    generateTable(fixed_table_x, fixed_table_y, $('#newton_table'), "newton", $("#tol_n").val().length-2);
    /**********************     Method logic    ******************************/
});

/******************************************************************************************
 ************************           SECANT METHOD           ********************************
 *******************************************************************************************/

$("#method6").on("click", function(event) {

    /**************     Variables declaration    *****************************/

    var iter = $("#iteration_s").val();
    var tol = parseFloat($("#tol_s").val());

    var scope = JSON.parse(document.getElementById("varibles").value);
    scope.x = 0;

    var x0 = scope.x;
    var x1 = scope.x;
    var x2 = scope.x;

    x0 += parseFloat($("#x0_s").val());
    x1 += parseFloat($("#x1_s").val());

    var fx0 = valueOf({
        "x": x0,
        "y": 0
    });
    var fx1 = 0;

    //Matrix
    var secant_table_X = [];
    var secant_table_y = [];

    var i = 0;
    secant_table_X[i] = x0;
    i++;
    secant_table_X[i] = x1;
    i++;

    /**************     /Variables declaration    ****************************/

    /**********************     Method logic    ******************************/

    if (fx0 == 0) {
        $("#secant_solution").text(x0 + " is Root");
    } else {
        fx1 = valueOf({
            "x": x1,
            "y": 0
        });
        var cont = 0;
        var error_abs = parseFloat(tol) + parseFloat(1);
        var den = parseFloat(fx1) - parseFloat(fx0);

        while ((error_abs > tol) && (fx1 != 0) && (den != 0) && (cont < iter)) {
            x2 = parseFloat(x1) - (fx1 * (parseFloat(x1) - parseFloat(x0)) / parseFloat(den));
            error_abs = Math.abs(parseFloat(x2) - parseFloat(x1));
            x0 = x1;
            fx0 = fx1;
            x1 = x2;

            fx1 = valueOf({
                "x": x1,
                "y": 0
            });
            den = parseFloat(fx1) - parseFloat(fx0);

            secant_table_X[i] = x2;
            i++;

            cont++;
        }

        if (fx1 == 0) {
            $("#secant_solution").text(x1 + " is Root");
        } else if (error_abs < tol) {
            $("#secant_solution").text(x0 + " is near a Root with " + tol + " of tolerance");
        } else if (den == 0) {
            $("#secant_solution").text("Multiple Root");
        } else {
            $("#secant_solution").text("Method failed with " + iter + " iterations");
        }
    }

    //Erase the table content
    $('#secant_table tbody > tr').remove();
    //Genearate the table
    generateTable(secant_table_X, secant_table_y, $('#secant_table'), "secant", $("#tol_s").val().length-2);

    /**********************     Method logic    ******************************/
});

 /******************************************************************************************
 ************************           MULTIPLE ROOTS          ********************************
 *******************************************************************************************/

$("#method7").on("click", function(event) {

    /**************     Variables declaration    *****************************/
    var tol = parseFloat($("#tol_m").val());

    var scope = JSON.parse(document.getElementById("varibles").value);
    scope.x = 0;

    var x0 = scope.x;
    var x1 = 0;

    x0 += parseFloat($("#xnumber_m").val());
    var iter = $("#iteration_m").val();
    var error_abs = parseFloat(tol) + parseFloat(1);
    var cont = 0;

    var fx = valueOf({
        "x": x0,
        "y": 0
    });
    var dfx = valueOf_fp({
        "x": x0,
        "y": 0
    }, "multiple1");
    var ddfx = valueOf_fp({
        "x": x0,
        "y": 0
    }, "multiple2");

    console.log('x0 '+ x0 +' fx '+fx+' dfx '+ dfx + ' ddfx '+ddfx);
    //Matrix
    var fixed_table_x = [];
    var fixed_table_y = [];

    fixed_table_x[cont] = x0;

    //x1 = parseFloat(-0.7) - ( (parseFloat(-65.12991316)*parseFloat(153.922149)) /( (parseFloat(153.922149^2))-(parseFloat(-65.12991316)*parseFloat(-168.1844717)) ) );
    x1 = parseFloat(153.922149)*parseFloat(153.922149);
    console.log('el valor resultante: '+x1);
    /**************     /Variables declaration    ****************************/

    /**********************     Method logic    ******************************/
    while ((error_abs > tol) && (fx != 0) && (dfx != 0) && (cont < iter)) {

        x1 = parseFloat(x0) - ( (parseFloat(fx)*parseFloat(dfx)) /( (parseFloat(dfx)*parseFloat(dfx))-(parseFloat(fx)*parseFloat(ddfx))  ) );
        
        fx = valueOf({
            "x": x1,
            "y": 0
        });
        dfx = valueOf_fp({
            "x": x1,
            "y": 0
        }, "multiple1");
        ddfx = valueOf_fp({
            "x": x1,
            "y": 0
        }, "multiple2");

        error_abs = Math.abs(parseFloat(x1) - parseFloat(x0));
        x0 = x1;
        cont++;
        console.log('->x0 '+ x0 +' fx '+fx+' dfx '+ dfx + ' ddfx '+ddfx + ' x1 '+x1);

        fixed_table_x[cont] = x1;
    }
    if (fx == 0) {
        $("#multiple_solution").text(parseFloat(xo).toFixed($("#tol_m").val().length-2) + " is Root");
    } else if (error_abs < tol) {
        $("#multiple_solution").text(parseFloat(x0).toFixed($("#tol_m").val().length-2) + " is near a Root with " 
                                    + tol + " of tolerance");
    } else {
        $("#multiple_solution").text("Method fail with " + iter + " iterations");
    }

    //Erase the table content
    $('#multiple_table tbody > tr').remove();
    //Genearate the table
    generateTable(fixed_table_x, fixed_table_y, $('#multiple_table'), "multiple", $("#tol_m").val().length-2);
    /**********************     Method logic    ******************************/
});

/******************************************************************************************
 ************************           TABLE GENERATOR         ********************************
 *******************************************************************************************/

function generateTable(mat1, mat2, table, method, tolerance) {
    //Row initialization
    var $row, $string1, $string2;
    if (method == "incremental") {
        for (var i = 0; i < mat1.length; i++) {
            $row = $row + '<tr><td>' + i 
                        + '</td><td>' + parseFloat(mat1[i])
                        + '</td><td>' + parseFloat(mat2[i]).toExponential(tolerance) 
                        +'</tr>';
        };
    }
    //i, xinf, xsup, xm, f(xm), error
    if (method == "bisection") {
        var xm = 0;
        var aux = 0;

        for (var i = 0; i < mat1.length; i++) {
            xm = (parseFloat(mat1[i]) + parseFloat(mat2[i])) / 2;
            ym = valueOf({
                "x": xm,
                "y": 0
            });
            $row = $row + '<tr><td>' 
                    + i + '</td><td>' 
                    + mat1[i].toFixed(tolerance) + '</td><td>' 
                    + mat2[i].toFixed(tolerance) + '</td><td>' 
                    + xm.toFixed(tolerance) + '</td><td>' 
                    + ym.toFixed(tolerance) + '</td><td>' 
                    + Math.abs(parseFloat(aux) - parseFloat(ym)).toExponential(tolerance) + '</td></tr>';

            aux = ym;
        };
    }
    if (method == "fixed") {
        for (var i = 0; i < mat1.length; i++) {
            $row = $row + '<tr><td>' 
                    + i + '</td><td>' 
                    + mat1[i].toFixed(tolerance) + '</td><td>' 
                    + valueOf({
                        "x": mat1[i],
                        "y": 0
                    }) + '</td><td>' 
                    + mat2[i].toFixed(tolerance) + '</td></tr>';
        };
    }
    //x, fx, f'x, error
    if (method == "newton") {
        var fx = 0;
        var dfx = 0;
        for (var i = 0; i < mat1.length; i++) {
            fx = valueOf({
                "x": parseFloat(mat1[i]),
                "y": 0
            });
            dfx = valueOf_fp({
                "x": parseFloat(mat1[i]),
                "y": 0
            }, "newton");

            $row = $row + '<tr><td>' 
                    + i + '</td><td>' 
                    + mat1[i].toFixed(tolerance) + '</td><td>' 
                    + fx.toFixed(tolerance) + '</td><td>' 
                    + dfx.toFixed(tolerance) + '</td><td>' 
                    + Math.abs(parseFloat(mat1[i]) - parseFloat(mat1[i - 1])).toExponential(tolerance) + '</td></tr>';
        };
    }
    //x, f(x), error
    if (method == "secant") {
        for (var i = 0; i < mat1.length; i++) {
            fx = valueOf({
                "x": parseFloat(mat1[i]),
                "y": 0
            });
            $row = $row + '<tr><td>' 
                    + i + '</td><td>' 
                    + mat1[i].toFixed(tolerance) + '</td><td>' 
                    + fx.toFixed(tolerance) + '</td><td>' 
                    + Math.abs(parseFloat(mat1[i]) - parseFloat(mat1[i - 1])).toExponential(tolerance) + '</td></tr>';
        };
    }
    //x, fx, f'x, f''x, error
    if (method == "multiple") {
        var fx = 0;
        var dfx = 0;
        var error = 0;
        for (var i = 0; i < mat1.length; i++) {
            fx = valueOf({
                "x": parseFloat(mat1[i]),
                "y": 0
            });
            dfx = valueOf_fp({
                "x": parseFloat(mat1[i]),
                "y": 0
            }, "multiple1");
            ddfx = valueOf_fp({
                "x": parseFloat(mat1[i]),
                "y": 0
            }, "multiple2");

            $row = $row + '<tr><td>' 
                    + i + '</td><td>' 
                    + mat1[i].toFixed(tolerance) + '</td><td>' 
                    + fx.toFixed(tolerance) + '</td><td>' 
                    + dfx.toFixed(tolerance) + '</td><td>' 
                    + ddfx.toFixed(tolerance) + '</td><td>' 
                    + Math.abs(parseFloat(mat1[i]) - parseFloat(mat1[i - 1])).toExponential(tolerance) + '</td></tr>';
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

function valueOf_fp(x, input) {

    if (input == "fixed") {
        var exp = document.getElementById("input_f").value;
    } else if (input == "newton") {
        var exp = document.getElementById("input_n").value;
    } else if (input == "multiple1"){
        var exp = document.getElementById("input_m").value;
    } else if (input == "multiple2"){
        var exp = document.getElementById("input_m2").value;
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

function valueOf(x) {
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