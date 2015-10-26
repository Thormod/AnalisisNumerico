this.i18n = {
  menu: {
    matrixOperations: "Operaciones con matrices",
    solvingSystemsOfLinearEquations: "Solución de Sistemas de Ecuaciones Lineales",
    determinantCalculation: "Calculadora de determinantes",
    examples: "Ejemplos de soluciones",
    eigenvalues: "Cálculo de valores propios y vectores propios",
    wikiLink: "http://es.wikipedia.org/wiki/Matriz_(matem%C3%A1ticas)",
    wiki: "Teoría necesaria"
  },
  index: {
    indexTitle: "Calculadora de Matrices",
    indexDescription: "Cálculo de suma de matrices, de diferencia de matrices, de producto de matrices, matriz inversa, de determinante, de matriz transpuesta; Reducir matrices en forma escalonada; Exponenciación",
    swapMatrices: "Intercambiar A y B",
    multiplyMatrices: "Multiplicación",
    addMatrices: "Adición",
    subtractBFromA: "Sustracción",
    indexIntro1: "Con esta calculadora podrás: calcular un determinante, un rango, una suma de matrices, un producto de matrices, una matriz inversa y otros.",
    findDeterminant: "Determinante",
    findInverse: "Matriz Inversa",
    findTranspose: "Matriz Transpuesta",
    findRank: "Rango",
    multiplyBy: "Multiplicar por",
    triangularMatrix: "Matriz Triangular",
    diagonalMatrix: "Matriz Diagonal",
    exponentiation: "Matriz elevada a"
  },
  slu: {
    showExampleOfSystemInput: "mostrar un ejemplo de input del sistema",
    sluDescription: "Resolver sistemas de ecuaciones lineales (Método de la Matriz Inversa, Método de Gauss, Regla de Cramer), calcular el número de soluciones.",
    sluHeader: "Solución de sistemas de ecuaciones lineales",
    sluIntro: "Esta aplicación resuelve <a href=\"http://es.wikipedia.org/wiki/Sistema_de_ecuaciones_lineales\">sistemas de ecuaciones lineales</a> por el método de <a href=\"http://es.wikipedia.org/wiki/Eliminaci%C3%B3n_de_Gauss-Jordan\">eliminación de Gauss</a>, por método de la <a href=\"http://www.youtube.com/watch?v=e6ERHxhpoOY\">Matriz Inversa</a> y por la <a href=\"http://es.wikipedia.org/wiki/Regla_de_Cramer\">Regla de Cramer</a>.\n" +
              "También se puede analizar la compatibilidad de sistemas por <a href=\"http://es.wikipedia.org/wiki/Teorema_de_Rouch%C3%A9%E2%80%93Frobenius\">Teorema_de_Rouché–Frobenius</a> para determinar el número de posibles soluciones.\n" +
              "Ingrese los coeficientes del sistema en las celdas y deje los campos en blanco si las variables no participan en la ecuación.",
    sluTitle: "Resolver sistemas de ecuaciones lineales online",
    testForConsistency: "Análisis de consistencia"
  },
  det: {
    detTitle: "Matriz determinante calculadora",
    detDescription: "",
    detHeader: "Matriz determinante calculadora",
    detIntro: "Esta calculadora ayuda a encontrar el <a href=\"http://es.wikipedia.org/wiki/Determinante_(matem%C3%A1tica)\">determinante</a>, ampliando una fila o columna, utilizando la fila de reducción para obtener ceros en una fila o columna. Los determinantes se calculan con la salida de los resultados intermedios.",
    expandByColumn: "Expandir por la columna",
    expandByRow: "Expandir por la fila",
    obtainZerosInColumn: "Obtener ceros en la columna",
    obtainZerosInRow: "Obtener ceros en la fila"
  },
  vectors: {
    vectorsTitle: "Vectores y valores propios",
    vectorsDescription: "Calculadora de los valores propios y vectores propios",
    vectorsHeader: "Calculo de los valores y vectores propios",
    vectorsIntro: "Esta calculadora le ayuda a encontrar los valores propios y los vectores propios utilizando el polinomio característico.",
    vectorsFind: "Encontrar"
  },
  footer: {
    externalLinks: " "
  },
  close: "Cerrar",
  matrix: "Matriz",
  cells: "celdas",
  clear: "limpiar",
  advices: "<ul>\n" +
           "<li>para trabajar con matrices rectangulares (no cuadradas) dejar <i>en blanco</i> las celdas que no se necesiten.</li>\n" +
           "<li>usted puede utilizar: fracciones decimales (finitas y periódicas): ${samples0}; expresiones aritméticas: ${samples1} .</li>\n" +
           "<li>utilice <kbd>↲ Entrar</kbd>, <kbd>Barra espaciadora</kbd>, <kbd>←</kbd>, <kbd>→</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd> para navegar sobre las celdas.</li>\n" +
           "<li>arrastre matrices de resultados (<a href=\"http://es.wikipedia.org/wiki/Arrastrar_y_soltar\">arrastrar y soltar</a>) o de un editor de texto.</li>\n" +
           "<li>para la teoría de matrices y operaciones con ellos, consulte la página <a href=\"http://es.wikipedia.org/wiki/Matriz_(matem%C3%A1ticas)\">Wikipedia</a></li>\n" +
           "</ul>",
  displayDecimal: "Mostrar números decimales",
  numberOfDecimalPlaces: "número de decimales",
  determinantIsEqualToZeroTheMatrixIsSingularNotInvertible: "El determinante de la matriz es cero, la matriz es no <a href=\"http://es.wikipedia.org/wiki/Matriz_invertible\">invertible</a>.",
  theNumberOfColumnsInFirstMatrixShouldEqualTheNumberOfRowsInSecond: "El número de columnas de la primera matriz debe coincidir con el número de filas de la segunda matriz.",
  matricesShouldHaveSameDimensions: "Las matrices deben tener el mismo tamaño, la misma cantidad de columnas y de filas.",
  summaryLabel: "Los detalles",
  text11: "1) Cálculo de los valores propios de el <a href=\"http://es.wikipedia.org/wiki/Polinomio_caracter%C3%ADstico\">polinomio característico</a>:",
  text12: "Esto es el sistema de ecuaciones lineales, podemos resolver el sistema por eliminación de Gauss:",
  text13: "2) Cálculo de los vectores propios para cada de los valores propios:",
  text14: "No hay decisiones racionales.",
  textAnalyseCompatibility: "Análisis de la compatibilidad del sistema.",
  textAn1a: "El rango de la matriz aumentada coincide con el rango de matriz de coeficientes y coincide con el número de incógnitas => el sistema es <a href=\"http://es.wikipedia.org/wiki/Sistema_de_ecuaciones_lineales#Tipos_de_sistemas\">compatible determinado</a>.",
  textAn1b: "El rango de la matriz aumentada coincide con el rango de matriz de coeficientes, pero no coincide con el número de incógnitas => el sistema es <a href=\"http://es.wikipedia.org/wiki/Sistema_de_ecuaciones_lineales#Tipos_de_sistemas\">compatible indeterminado</a>.",
  textAn2: "El rango de la matriz ampliada no coincide con el rango de matriz de coeficientes = > el sistema <a href=\"http://es.wikipedia.org/wiki/Sistema_de_ecuaciones_lineales#Tipos_de_sistemas\">incompatible</a> (no presenta ninguna solución).",
  text01: "Para resolver por <a href=\"http://es.wikipedia.org/wiki/Regla_de_Cramer\">la regla de Cramer</a> el número de ecuaciones debe ser igual al número de incógnitas",
  text02: "Para resolver por <a href=\"http://es.wikipedia.org/wiki/Regla_de_Cramer\">la regla de Cramer</a> el determinante de la matriz los coeficientes (matriz del sistema) debe ser diferente de cero",
  text05: "Para resolver el sistema por el método de la matriz inversa ella debe tener el mismo número de ecuaciones como incógnitas.",
  text06: "Para resolver el sistema por el método de la matriz inversa el determinante de la matriz de sistema debe ser diferente de cero",
  textAnswer: "La respuesta:",
  solutionByRuleOfCramer: "La solución por la [regla de Cramer](https://es.wikipedia.org/wiki/Regla_de_Cramer)",
  solutionByInverseMatrixMethod: "La solución por el [método de la matriz inversa](http://recursostic.educacion.es/descartes/web/materiales_didacticos/sistemas_de_ecuaciones_lineales_2bcnt/metodo_de_la_matriz_inversa.htm)",
  solutionByGaussianElimination: "La solución por el [método de Gauss](https://es.wikipedia.org/wiki/Sistema_de_ecuaciones_lineales#M.C3.A9todo_de_Gauss)",
  solutionByGaussJordanElimination: "La solución por el [método de Gauss-Jordan](https://es.wikipedia.org/wiki/Sistema_de_ecuaciones_lineales#Eliminaci.C3.B3n_de_Gauss-Jordan)",
  text511: "La matriz aumentada del sistema:",
  text52: "No existe solución.",
  fromEquationIFindVariable: "De la ecuación ${i} del sistema <a href=\"#system_1\">(1)</a> encontramos con la variable ${x}:",
  text53: "La solución general:",
  textInsertin: "insertar en",
  textClear: "limpiar",
  textFundamentalSystem: "El sistema fundamental de soluciones",
  textBasicSolutions: "Las soluciones fundamentáis",
  inputError: "Por favor, compruebe los datos introducidos (podéis introducir algunas expresiones, como: 1/23 , 12.45 , -1.3 (56); 1.2e - 4 , 2/3 3 * ( 4.10 ) ( 1 + x) / y ^ 2 )",
  matrixIsNotSquare: "La matriz no es cuadrada",
  divisionByZeroError: "División por cero",
  exponentIsNegative: "La exponente es negativo",
  or: "o",
  showText: "Mostrar como texto",
  showMathML: "Mostrar como MathML",
  showImage: "Mostrar como imagen",
  showComments: "Comentarios",
  tweet: "Tweet",
  notEnoughRationalEigenvalues: "No hay suficientes valores propios racionales",
  solveByCrammer: "Solución por la Regla de Cramer",
  solveByInverse: "Solución por el Método de la Matriz Inversa",
  solveByGauss: "Solución por el Método de Gauss",
  solveByJordanGauss: "Solución por el Método de Gauss-Jordan",
  usingSarrusRule: "Usando <a href=\"http://es.wikipedia.org/wiki/Regla_de_Sarrus\">la regla de sarrus</a>",
  theRuleOfSarrusCanBeUsedOnlyWith3x3Matrices: "La regla de Sarrus sólo se aplica a matrices de 3x3",
  notDiagonalizable: "La matriz no es diagonalizable, porque no tiene ${n} vectores propios linealmente independientes.",
  analyseCompatibilityIntroduction: "",
  text512: "<div>Transformar la matriz aumentada del sistema em uma matriz en forma escalonada:</div>",
  language: "español",
  copyToClipboard: "Copiar",
  determinant2x2Link: "https://es.wikipedia.org/wiki/Determinante_(matem%C3%A1tica)#Matrices_de_orden_inferior",
  inverse2x2: "Encontrar la inversa de una matriz de 2x2 mediante la fórmula:",
  inverse2x2Link: "https://es.wikipedia.org/wiki/Matriz_invertible#Inversi.C3.B3n_de_matrices_2.C3.972",
  ruleOfSarrus: "Regla de Sarrus",
  ruleOfSarrusLink: "https://es.wikipedia.org/wiki/Regla_de_Sarrus",
  ruleOfTriangle: "Regla de triángulo",
  ruleOfTriangleLink: "http://www.youtube.com/watch?v=v84ZlIcSc5o",
  matrixMultiplicationLink: "https://es.wikipedia.org/wiki/Multiplicaci%C3%B3n_de_matrices",
  matrixMultiplication: "Multiplicación de matrices",
  matrixMultiplicationInfo: "[Multiplicación de matrices](https://es.wikipedia.org/wiki/Multiplicaci%C3%B3n_de_matrices): filas de la primera matriz se multiplican por columnas de la segunda matriz",
  solutionByMethodOfMontante: "La solución por [el método de Montante](${link})",
  solutionByMethodOfMontanteLink: "https://es.wikipedia.org/wiki/M%C3%A9todo_Montante",
  methodOfGauss: "El método de eliminación de Gauss",
  methodOfGaussJordan: "El método de eliminación de Gauss-Jordan",
  inverseDetailsUsingAdjugateMatrix: "usando la matriz de adjuntos",
  inverseDetailsUsingAdjugateMatrixLink: "https://es.wikipedia.org/wiki/Matriz_de_adjuntos",
  methodOfMontante: "Método de Montante",
  samples0: "<code>1/23</code>, <code>12.45</code>, <code>-1.3(56)</code>, <code>1.2e-4</code>",
  samples0Lang: "en",
  samples1: "<code>2/3+3*(10-4)</code>, <code>(1+x)/y^2</code>, <code>2^0.5</code>",
  samples1Lang: "en",
  rankDenotation: "rango",
  matrixRowDenotation: "<msub><mrow><mi>F</mi></mrow><mrow><mn>${i}</mn></mrow></msub>",
  rankDetails: {
    start: "",
    startLang: "en"
  },
  determinantDetails: {
    start: "",
    startLang: "en"
  },
  inverseDetails: {
    start: "",
    startLang: "en"
  },
  eliminationDetails: {
    pivotElement: "El elemento pivote:",
    rowAddition: "Añadimos a la fila <code>${c}</code> la fila <code>${s}</code>:",
    rowSwapNegate: "Intercambiamos las filas <code>${c}</code> y <mo>&minus;</mo><mn>1</mn> veces <code>${s}</code>:",
    rowSwap: "Intercambiamos las filas <code>${c}</code> y <code>${s}</code>:",
    rowDivision: "Dividimos la fila <code>${s}</code> por <code>${B}</code>:",
    rowSubtraction: "Multiplicamos la fila <code>${c}</code> por <code>${Q}</code> y la restamos a la fila <code>${s}</code>:"
  },
  use: "Usar",
  examples2: "Ejemplos",
  methodOfMontanteDetails: {
    rankDetails: {
      start: "",
      startLang: "en"
    },
    determinantDetails: {
      start: "<h4>Cálculo del determinante utilizando el<a href=\"http://www.youtube.com/watch?v=_EZOcBzxn8k\">Método Montante</a></h4>\n" +
             "<p>El determinante es igual al elemento de la última fila de la forma escalonada por filas. `a_(i,j)=(a_(r,c)*a_(i,j)-a_(i,c)*a_(r,j))/p`, dónde `a_(r,c)` es un elemento de pivote y `p` es un valor del pivote anterior. Nota: ${someDetails3}.</p>"
    },
    inverseDetails: {
      start: "",
      startLang: "en"
    }
  },
  pleaseFillOutThisField: "Por favor, rellene este campo."
};