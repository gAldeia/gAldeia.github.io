//ITLS.js


//o funcionamento desse script precisa da existência de um vetor de objetos
//do tipo DataPoint, chamado inputPoints. Toda a criação e preparação desse
//vetor é feita no arquivo loadFile.

var MiniExpression = function(numberOfVariables, exponentRange){

    //expressão pequena. recebe um dataPoint para tomar como parâmetro na hora de ajustar suas variáveis internas.

    //construtor:

    //inicialização das variáveis (variáveis são privadas)
    var size = numberOfVariables;
    var exponents = [ ];
    var operation = getRndOp();

    for(var i=0; i<size; i++){
        exponents.push(1);
    }

    //métodos públicos
    return {
        getMiniExpression_d : function(){

            //retorna uma string contendo a expressão.

            var expression = operation + "(";
            for(var i=0; i<size; i++){
                expression += "x" + i + "^" + exponents[i] + (i<size-1? " * " : "");
            }
            return expression + ")";
        },

        getSize : function(){
            return size;
        },

        getOp : function(){
            return operation;
        },

        setOp : function(op){
            operation = op;
        },

        shiftOp : function (){
            
            //faz um shift no operador, útil para a busca local.
        
            switch(operation){
                case "id": //identidade
                    return "sin";
                case "sin": //seno
                    return "cos";
                case "cos": //cosseno
                    return "tan";
                case "tan": //tangente
                    return "abs";
                case "abs": //módulo
                    return "sqrt";
                case "sqrt": //raiz quadrada
                    return "exp";
                case "exp": //exponencial
                    return "log";
                case "log": //log 
                    return "id";
                default:
                    alert("PROBLEMA EM SHIFTOPERATOR");
            }
        },

        evaluate : function(DataPoint){

            //recebe um ponto (DataPoint) e calcula o valor da função para os dados valores de x

            var value = 1.0;

            for(var i=0; i<DataPoint.x.length; i++){
                value *= Math.pow(DataPoint.x[i], exponents[i]);
            }

            switch (operation){
                case "id": //identidade
                    return value;
                case "sin": //seno
                    return Math.sin(value);
                case "cos": //cosseno
                    return Math.cos(value);
                case "tan": //tangente
                    return Math.tan(value);
                case "abs": //módulo
                    return Math.abs(value);
                case "sqrt": //raiz quadrada
                    return value<=0? 0 : Math.sqrt(value);
                case "exp": //exponencial
                    return Math.exp( Math.floor(value) );
                case "log": //log 
                    return Math.log(value);
                default:
                    alert("PROBLEMA EM EVALUATESIMPLEFUNCTIOn");
            }
        },

        getExp : function(index){
            //out of range
            if (index>=size)
                return 0;
            return exponents[index];
        },

        setExp : function(index, value){
            //out of range
            if (index>=size)
                return 0;
            exponents[index] = value;
        },

        increaseExp : function (index, value){

            //out of range
            if (index>=size)
                return 0;
            exponents[index] += value;
        }
    };
};

var Expression = function(expressionSize, numberOfVariables, exponentRange){

    //expressão completa, composta por "size" expressões pequenas

    //construtor:

    //membros privados
    var size = expressionSize;
    var coefficients = [ ];
    var equation = [ ];
    
    //esses membros são de interesse externo
    var mse = 0.0;
    var expressionValue = 0.0;

    for (var i=0; i<size; i++){
        equation.push(new MiniExpression(numberOfVariables, exponentRange));

        //inicializa os coeficientes com 1.0, para não ter influencia
        coefficients.push(1.0);
    }

    var adjustCoefficients = function(inputPoints, numIterations, learningRate){

        //ajusta os parâmetros.

        for(var i=0; i<numIterations; i++){

            for(var j=0; j<size; j++){
                var result = 0.0;
      
                coefficients[j]=1;

                for(var k=0; k<inputPoints.length; k++){
                    aux = equation[j].evaluate(inputPoints[k]);

                    result += (aux*coefficients[j] - inputPoints[k].y)*aux;
                }
                //não sei se deveria tirar a média
                result *= 2/inputPoints.length;

                coefficients[j] -= learningRate*result;

                //caso o coeficiente cresça tanto que vire NaN ou infinito
                if (isNaN(coefficients[j]) || !isFinite(coefficients[j]))
                    coefficients[j] = 1;
            }
        }
    };

    var calculateMse = function(inputPoints){

        //calcula o mse.
        mse = 0.0;

        for(var i=0; i< inputPoints.length; i++){
            var aux = 0.0;

            for(var j=0; j<size; j++){
                aux+= coefficients[j]*equation[j].evaluate(inputPoints[i]);
            }
            mse += Math.pow(inputPoints[i].y - aux, 2);
        }
        mse = Math.sqrt(mse/inputPoints.length);

        if (!isFinite(mse) || isNaN(mse))
            mse = Math.exp(300);
    };

    return{
        getExpression_d : function(){

            //retorna uma string da expressão

            var expression = "";
            for(var i=0; i<size; i++){
                expression += coefficients[i].toFixed(2) + "*" + equation[i].getMiniExpression_d() + (i<size-1? "+" : "");
            }

            return expression;
        },

        getMse : function(){
            return mse;
        },

        evaluate : function(inputPoints){

            //para avaliar é preciso ajustar os coeficientes e calcular o novo mse.

            adjustCoefficients(inputPoints, 500, 0.25);
            calculateMse(inputPoints);

            return mse;
        },

        localSearch : function(inputPoints, numberOfOperators){

            //local search nos operadores:
            //faz um shift entre os operadores (8 operadores no total)

            var previousMse;

            //operador
            var bestOp;

            //expoente
            var bestExp;

            //percorre todas as mini expressões
            for (var i=0; i<size; i++){
                //salva o mse anterior do local search
                previousMse = mse;

                //salva os anteriores p comparações
                bestOp = equation[i].getOp();

                for(var j=0; j<numberOfOperators; j++){
                    //percorre cada um dos operadores buscando um novo melhor
                    equation[i].shiftOp();
                    this.evaluate(inputPoints);

                    if (mse < previousMse){
                        bestOp = equation[i].getOp();
                        previousMse = mse;
                    }
                }
                equation[i].setOp(bestOp);

                //atualiza o mse do local search para efetuar nos expoentes
                previousMse = mse;

                //local search entre os exp:
                for (var j=0; j<equation[0].getSize(); j++){
                    
                    bestExp = equation[i].getExp(j);

                    //aumenta 1 no original e calcula
                    equation[i].increaseExp(j, 1);
                    this.evaluate(inputPoints);
                    if (mse < previousMse){
                        bestExp++;
                        previousMse = mse;
                    }
                    //aqui a diminuição não é feita diretamente para -2 pois
                    //faz com que o coeficiente seja ajustado a partir do
                    //valor que foi calculado após aumentar o exp em 1.
                    //isso faz com que o valor seja diferente do que inicial-
                    //mente, influenciando no calculo. ISSO SERÁ ARRUMADO!    

                    //diminui 1 no original e calcula
                    equation[i].increaseExp(j, -2);
                    this.evaluate(inputPoints);
                    if (mse < previousMse){
                        bestExp--;
                        previousMse = mse;
                    }

                    equation[i].setExp(j, bestExp);
                    
                    //caso o diminuido seja menor, não faz nada, pois já está diminuido
                    this.evaluate(inputPoints);
                }
            }
        }
    };
};

var Population = function(populationSize, expressionSize, numberOfVariables, exponentRange){

    //"gerenciadora" da população

    var subjects = [ ];
    var size = populationSize;

    for(var i=0; i<size; i++){
        subjects.push(new Expression(expressionSize, numberOfVariables, exponentRange));
    }

    //aqui chama o ajuste de coeficientes e calculo do mse
    for(var i=0; i<size; i++){
        subjects[i].evaluate(inputPoints);
    }

    var theBest = subjects[0];

    var findBestExpression = function(){
        //pega a melhor expressão da pop (a com o menor mse)
        
        for(var i=0; i<size; i++){
            if(subjects[i].getMse() <= theBest.getMse())
                theBest = subjects[i];
        }
    };

    return {

        getBestExpression_d : function(){
            findBestExpression();
            return theBest.getExpression_d();
        },

        getBestExpressionMse_d : function(){
            return theBest.getMse();
        },

        evaluate : function(){
            
            //chama os métodos de todos os individuos

            for(var i=0; i<size; i++){
                subjects[i].evaluate(inputPoints);
            }
        },

        localSearch : function(inputPoints, numberOfOperators){
            for(var i=0; i<size; i++){
                subjects[i].localSearch(inputPoints, numberOfOperators);
                subjects[i].evaluate(inputPoints);
            }
        },

        localSearchBestExpression : function(inputPoints, numberOfOperators){

            //executa o local search, mas só no melhor indivíduo, e não
            //na pop inteira.
            findBestExpression();
            theBest.localSearch(inputPoints, numberOfOperators);
            //theBest.evaluate(inputPoints); acho que isso está redundante!!!
        }
    };
};

// --FUNÇÕES ÚTEIS----------------------------------------------------------- //
function getRndInt(min, max) {

	//função que recebe um intervalo de números inteiros (min e max)
	//e retorna um número inteiro aleatório entre eles (incluíndo o
	// min e max).

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRndOp(){

	//função que sorteia um operador aleatório para uma função menor.
	//a identidade também atua como a multiplicação dos termos; e a
	//divisão ocorre quando um termo é elevado à um número negativo,
	//assim, as quatro operações básicas estão inclusas (+, -, /, *).
	//funções trigonométricas, raiz, exponencial, logarítmo e módulo
	//também foram incluidas na lista.

	switch(getRndInt(0, 7)){
		case 0: //identidade
			return "id";
		case 1: //seno
			return "sin";
		case 2: //cosseno
			return "cos";
		case 3: //tangente
			return "tan";
		case 4: //módulo
			return "abs";
		case 5: //raiz quadrada
			return "sqrt";
		case 6: //exponencial
			return "exp";
		case 7: //log 
			return "log";
		default:
			alert("PROBLEMA EM GETRANDOMOPERATION");
	}
}


// -------------------------------------------------------------------------- //

function run_ITLS(){

	//cria uma nova população
	var myPop = new Population(25, 2, inputPoints[0].x.length, 3);
    myPop.evaluate(inputPoints); 

    //imprime informação no canvas
    document.getElementById("results").innerHTML="<p>População criada. O melhor da primeira pop:</p>";
    document.getElementById("results").innerHTML+="<p><pre>Expressão: "+myPop.getBestExpression_d()+"</p><p>MSE: "+myPop.getBestExpressionMse_d()+"</p>";

    var previousMse;
    var counter = 0;

    //O algoritmo só para quando uma busca local nova não modificar o valor do MSE.

    do {
        previousMse = myPop.getBestExpressionMse_d();
        myPop.localSearchBestExpression(inputPoints, 7);
        counter++;

    }while (previousMse !=myPop.getBestExpressionMse_d());

    document.getElementById("results").innerHTML+="<p>O algoritmo executou "+(counter++)+" buscas locais, e o resultado foi:</p>";
    document.getElementById("results").innerHTML+="<p><pre>Expressão: "+myPop.getBestExpression_d()+"</p><p>MSE: "+myPop.getBestExpressionMse_d()+"</p>";
}