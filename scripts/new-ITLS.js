//new-ITLS.js


//o funcionamento desse script precisa da existência de um vetor de objetos
//do tipo DataPoint, chamado inputPoints. Toda a criação e preparação desse
//vetor é feita no arquivo loadFile.


// CLASSES DA ÁRVORE--------------------------------------------------------- //
var Operator = {

    nextN : function(op, n){
        var operators = ["id", "sin", "cos", "tan", "abs", "sqrt", "exp", "log"];
        
        return (operators[ (operators.indexOf(op)+n)%operators.length ]);
    },

    rndOp : function(){
        var operators = ["id", "sin", "cos", "tan", "abs", "sqrt", "exp", "log"];
        
        return (operators[Math.floor(Math.random() * (0 - 7 + 1)) + 7]);
    },

    solve : function(op, value){
        switch (op){
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
                alert("PROBLEMA EM SOLVE OPERATOR");
        }
    },

    id : "id",

    operators : ["id", "sin", "cos", "tan", "abs", "sqrt", "exp", "log"],

    length : 8
}

var Term = function(exponents, operation){

    this.exp = exponents;
    this.op = operation;

    this.evaluate = function(DataPoint){
        
        //recebe um ponto (DataPoint) e calcula o valor da função para os dados valores de x

        var value = 1.0;

        for(var i=0; i<this.exp.length; i++){
            value *= Math.pow(DataPoint.x[i], this.exp[i]);
        }
        
        return Operator.solve(this.op, value);
    },

    this.getTerm_d = function(){
        
        //retorna uma string contendo a expressão.

        var term = this.op + "(";
        for(var i=0; i<this.exp.length; i++){
            term += "x" + i + "^" + this.exp[i] + (i<this.exp.length-1? " * " : "");
        }
        return term + ")";
    },

    this.getExp = function(){
        return this.exp;
    },

    this.getOp = function(){
        return this.op;
    },

    this.getSize = function(){
        return this.exp.length;
    }
}

var LinearExpression = function(termsToUse){

    //construtor cria uma cópia de todos os termos passados.

    this.coefficients = [ ];
    this.terms = termsToUse;
    this.score = 0.0;

    //criando todas as cópias
    for (var i=0; i<this.terms.length; i++){
        this.coefficients.push(1.0);
    }

    //métodos internos
    this.adjustCoefficients = function(inputPoints, numIterations){

        var iteration = -1;
        var alpha = 0.01/inputPoints.length;
        var prevError = 0;

        //numero de iterações
        while(++iteration<numIterations){

            for (var i=0; i<inputPoints.length; i++){
                var guess = 0.0;

                for (j=0; j<this.terms.length; j++){
                    guess += this.terms[j].evaluate(inputPoints[i])*this.coefficients[j];
                }

                var error = inputPoints[i].y - guess;

                for (var j=0; j<this.terms.length; j++){
                    
                    //ajustes dos learningRates
                    this.coefficients[j] += alpha*this.terms[j].evaluate(inputPoints[i])*error;
                }

                if ( Math.abs(prevError-error)<0.0001 ) //critério de parada
                    return;
                else
                    prevError = error;
            }
        }

        //limpando os nan
        for(var i=0; i<this.coefficients.length; i++){
            if (!isFinite(this.coefficients[i])){
                this.coefficients[i] = 0.0; //se não é finito o numero provavelmente explodiu, então zerando-o eu faço com que seja cortado no simplify
            }
        }
    };

    this.calculateMAE = function(inputPoints){
        
        //calcula o mse.
        var mae = 0.0;

        for(var i=0; i<inputPoints.length; i++){
            var aux = 0.0;

            for(var j=0; j<this.terms.length; j++){
                aux +=this. coefficients[j]*(this.terms[j].evaluate(inputPoints[i]));
            }
            mae += Math.abs(inputPoints[i].y - aux);
        }
        mae = mae/inputPoints.length;

        if (isFinite(mae))
            this.score = 1/ (1+ mae);
        else 
            this.score = 0.0;
        
        return mae;
    };

    //ajuste inicial (executado no construtor)
    this.adjustCoefficients(inputPoints, 10000);
    this.calculateMAE(inputPoints);

    this.getLinearExpression_d = function(){
        
        //retorna uma string da expressão

        var linearExpression = "";
        for(var i=0; i<this.terms.length; i++)
            linearExpression += this.coefficients[i].toFixed(2) + "*" + this.terms[i].getTerm_d() + (i<this.terms.length-1? "+" : "");

        return linearExpression;
    },

    this.evaluateScore = function(inputPoints){
        //adjustCoefficients(inputPoints, 10000);
        this.calculateMAE(inputPoints);

        return this.score;
    },

    this.simplify = function(threshold){
        
        //percorre uma expressão removendo todo termo de coeficiente menor
        //que o valor de threshold
    
        var newTerms = [ ];
        var newCoefs = [ ];

        for (var i=0; i<this.coefficients.length; i++){
            if (Math.abs(this.coefficients[i]) > threshold){
                newTerms.push(this.terms[i]);
                newCoefs.push(this.coefficients[i]);
            }
        }

        this.terms = newTerms;
        this.coefficients = newCoefs;

        this.evaluateScore(inputPoints);
    };

    this.getScore = function(){
        return this.score;
    },

    this.getCoefficients = function(){
        return this.coefficients;
    },

    this.getTerms = function(){
        return this.terms;
    }
}

var Population = function(populationSize, expressionSize){

    //"gerenciadora" da população

    this.subjects = [ ];
    this.size = populationSize;

    for(var i=1; i<=this.size; i++){
        this.subjects.push( new LinearExpression( rndTerms(expressionSize) ) );
        if (i%(this.size/5)==0) expressionSize++;
    }

    //aqui chama o ajuste de coeficientes e calculo do mse
    //AGORA ISSO É FEITO NO CONSTRUTOR
    /*
    for(var i=0; i<this.size; i++){
        this.subjects[i].evaluate(inputPoints);
    }*/

    this.theBest = this.subjects[0];

    this.findBestExpression = function(){
        for(var i=0; i<this.size; i++){
            if(this.subjects[i].getScore() > this.theBest.getScore())
                this.theBest = this.subjects[i];
        }
        return this.theBest;
    };

    this.getBestExpression_d = function(){
        return this.theBest.getLinearExpression_d();
    },

    this.getBestExpressionScore_d = function(){
        return this.theBest.getScore();
    },

    this.evaluate = function(){
        
        //chama os métodos de todos os individuos

        for(var i=0; i<this.size; i++){
            this.subjects[i].evaluateScore(inputPoints);
        }
    },

    this.localSearch = function(inputPoints){

        var bestExpression = this.findBestExpression();
        var bestExpressionTerms = bestExpression.getTerms();
        var candidates = [ ];

        //garante que se não houver melhorias
        //com a busca local, ainda existirá uma expressão para retornar
        candidates.push(bestExpression); 

        //percorre termo a termo fazendo todas as mudanças possíveis no operador
        //de cada um e guarda as expressões de melhor score para comparar no
        //final.
        for (var i=0; i<bestExpressionTerms.length; i++){
            var auxTerms = bestExpressionTerms;

            for (var j=1; j<=Operator.length; j++){
                auxTerms[i].op = Operator.nextN(bestExpressionTerms[i].getOp(), j);

                var operatorSearch = new LinearExpression(auxTerms);

                if (operatorSearch.getScore() > bestExpression.getScore()){
                    candidates.push(operatorSearch);
                }
            }
        }

        /*
        console.log(candidates.length);
        var expCandidates = [ ];

        for(var i=0; i<candidates.length; i++){ //percorre cada candidato
            for (var j=0; j<candidates[i].terms.length; j++){ //percorre cada termo 
                for (var k=0; k<candidates[i].terms[j].exp.length; k++){ //percorre cada exp
                    expCandidates.push(new LinearExpression(candidates[i].getTerms()));

                    if (expCandidates[expCandidates.length-1].getScore()>0.99){
                        return expCandidates[expCandidates.length-1];
                    }

                    candidates[i].terms[j].exp[k] +=1;
                    expCandidates.push(new LinearExpression(candidates[i].getTerms()));
                    if (expCandidates[expCandidates.length-1].getScore()>0.99){
                        return expCandidates[expCandidates.length-1];
                    }

                    candidates[i].terms[j].exp[k] -=2;
                    expCandidates.push( new LinearExpression(candidates[i].getTerms()));
                    if (expCandidates[expCandidates.length-1].getScore()>0.99){
                        return expCandidates[expCandidates.length-1];
                    }
                }
            }
        }*/

        //retorna o melhor do local search (se não houver melhor, retorna 
        //a melhor expressão da pop)
        var bestLocalSearch = candidates[0];

        for(var i=1; i<candidates.length; i++){
            if (candidates[i].getScore()>bestLocalSearch.getScore()){
                bestLocalSearch = candidates[i];
            }
        }
        
        return bestLocalSearch;
    },

    this.localSearchBestExpression = function(inputPoints){

        this.theBest = this.localSearch(inputPoints);

        //executa o local search, mas só no melhor indivíduo, e não
        //na pop inteira.
        /*
        this.theBest.localSearch(inputPoints);
        */
    }
};


// MÉTODOS AUXILIARES---------------------------------------------------------------- //

function rndTerms(howMany){

    //conjunto de termos (que são conjuntos de expoentes)

    var terms = [ ];

    for (var i=0; i<howMany; i++){
        var aux = [ ];
        for (var j=0; j< inputPoints[0].x.length; j++){
            aux.push( Math.floor(Math.random()*4) );
        }
        terms.push(new Term(aux, Operator.rndOp()) );
    }

    return terms;
}
// -------------------------------------------------------------------------- //

function run_ITLS(){
    
    if (inputPoints[0]==undefined){
        document.getElementById("results").innerHTML="<div class='alert alert-danger'><p class='text-justify'><strong>Atenção!</strong> Você não enviou nenhuma entrada de dados para o site!</p></div>";
        return;
    }

	//cria uma nova população
	var myPop = new Population(100, 1);
    myPop.evaluate(inputPoints); 

    myPop.findBestExpression();

    //imprime informação no canvas
    document.getElementById("results").innerHTML="<p>População criada. A melhor expressão inicial:</p>";
    document.getElementById("results").innerHTML+="<p><pre>Expressão: "+myPop.getBestExpression_d()+"</p><p>Score: "+myPop.getBestExpressionScore_d()+"</p>";

    if (myPop.getBestExpressionScore_d()>=0.999999){
        return;
    }

    var prevScore;
    var counter = 0;

    //O algoritmo só para quando uma busca local nova não modificar o valor do MSE.

    do {
        myPop.findBestExpression();
        prevScore = myPop.getBestExpressionScore_d();
        myPop.localSearchBestExpression(inputPoints);
    }while (prevScore !=myPop.getBestExpressionScore_d() || counter++>5);

    document.getElementById("results").innerHTML+="<p>O algoritmo executou "+(counter++)+" buscas locais, e o resultado foi:</p>";
    document.getElementById("results").innerHTML+="<p><pre>Expressão: "+myPop.getBestExpression_d()+"</p><p>Score: "+myPop.getBestExpressionScore_d()+"</p>";
}
