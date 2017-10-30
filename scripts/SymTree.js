//SymTree.js


//o funcionamento desse script precisa da existência de um vetor de objetos
//do tipo DataPoint, chamado inputPoints. Toda a criação e preparação desse
//vetor é feita no arquivo loadFile.


// CLASSES DA ÁRVORE--------------------------------------------------------- //
var Operator = {

    nextN : function(op, n){
        var operators = ["id", "sin", "cos", "tan", "abs", "sqrt", "exp", "log"];
        
        return (operators[ (operators.indexOf(op)+n)%operators.length ]);
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
        
        /*
            RPROP - INCOMPLETO/NÃO FUNCIONANDO CORRETAMENT

            //ajusta os parâmetros, minimizando a soma quadrática dos erros
            //cada termo tem seu próprio learning rate
            var learningRates = [ ];
            var termsValues = [ ];
            var prevTermsValues = [ ];

            var increaseFactor = 1.2;
            var decreaseFactor = 0.5;

            var iteration = -1;
            
            //coloca todos os coeficientes no mesmo valor inicial
            for(var i=0; i<coefficients.length; i++){
                learningRates.push(0.1/inputPoints.length);
                prevTermsValues.push(0.0);
                termsValues.push(0.0);
            }

            //numero de iterações
            while(++iteration<numIterations){

                for (var i=0; i<inputPoints.length; i++){
                    var result = 0.0;

                    for (j=0; j<terms.length; j++){
                        termsValues[j] = terms[j].evaluate(inputPoints[i])*coefficients[j];

                        result += termsValues[j];
                    }

                    var error = result - inputPoints[i].y;

                    for (var j=0; j<terms.length; j++){
                        
                        //ajustes dos learningRates
                        if (prevTermsValues[j]*termsValues[j]>0){
                            learningRates[j]  *= Math.min(decreaseFactor, 100);
                            coefficients[j] -= learningRates[j]*terms[j].evaluate(inputPoints[i])*error;
                        }
                        else if (prevTermsValues[j]*termsValues[j]<0){
                            learningRates[j]  *= Math.max(increaseFactor, 0.0001);
                            coefficients[j] -= learningRates[j]*terms[j].evaluate(inputPoints[i])*error;
                        }
                    }
                    prevTermsValues = termsValues;
                }
            }
        */

        var iteration = -1;
        var alpha = 0.01/inputPoints.length;

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

    this.interaction = function(){
    
        var result = [ ];
    
        for (var i=0; i<this.terms.length; i++){
            for (var j=i; j<this.terms.length; j++){
                result.push( new Term(vSum(this.terms[i].getExp(), this.terms[j].getExp()), Operator.id) );
            }
        }
        return result;
    };

    this.inverse = function(){
        var result = [ ];
    
        for (var i=0; i<this.terms.length; i++){
            for (var j=i; j<this.terms.length; j++){
                result.push(new Term(vSub(this.terms[i].getExp(), this.terms[j].getExp()), Operator.id) );
            }
        }
        return result;
    },

    this.transformation = function(){
        
        var result = [ ];

        for (var i=0; i<this.terms.length; i++){
            for (var j=1; j<Operator.length; j++){
                result.push( new Term(this.terms[i].getExp(), Operator.nextN(this.terms[i].getOp(), j) ) );
            }
        }
        
        return result;
    },

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


// MÉTODOS AUXILIARES-------------------------------------------------------- //
function rootTerms(){
    //cria um grupinho que serve pra inicializar o root
    var terms = [ ];

    for(var i=0; i<inputPoints[0].x.length; i++){
        var aux = [ ];
        for (var j=0; j<inputPoints[0].x.length; j++)
            aux.push(i==j? 1 : 0);
        terms.push(new Term(aux, Operator.id ));
    }
    return terms;
}

function vSum(vector1, vector2){

    //soma vetorial

    var aux = [ ];

    for(var i=0; i<vector1.length; i++){
        aux.push(vector1[i]+vector2[i]);
    }
    return aux;
}

function vSub(vector1, vector2){
    
    //subtração vetorial

    var aux = [ ];

    for(var i=0; i<vector1.length; i++){
        aux.push(vector1[i]-vector2[i]);
    }
    return aux;
}

function expandedList(leaf, minI, minT){

    //expande todas as operações (sem usar o concat).

    var exp_list = [ ];

    exp_list.push.apply(exp_list, leaf.interaction());
    
    if (minI){
        exp_list.push.apply(exp_list, leaf.inverse());
    }
    if (minT){
        exp_list.push.apply(exp_list, leaf.transformation());
    }

    return exp_list;
}

function expand(leaf, threshold, minI, minT){

    //list <- interaction U inverse U transformation
    var exp_list = expandedList(leaf, minI, minT);

    //terms <- [term e Terms if score(node + term) > score(node)]
    var refined_exp_list = [ ];

    for (var i=0; i<exp_list.length; i++){
        var aux_terms = leaf.getTerms();
        var aux = new LinearExpression(aux_terms.concat([exp_list[i]])); 
        if (aux.getScore() > leaf.getScore()){//score é calculado no construtor
            refined_exp_list.push(exp_list[i]);
        }
    }
    
    //remove da exp_list aqueles termos que já estão na expressão
    var toCheck = leaf.getTerms();

    for (var i=0; i<toCheck.length; i++){
        for(var j=refined_exp_list.length-1; j>=0; j--){
            if (toCheck[i].getTerm_d()==refined_exp_list[j].getTerm_d()){ //compara a string de cada um
                refined_exp_list.slice(j, 1);
            }
        }
    }

    var children = [ ];

    while (refined_exp_list.length>0){


        //esta seria a greedy search
        var best = leaf;

        for(var i=refined_exp_list.length-1; i>=0; i--){
            var aux_terms = best.getTerms();
            var aux = new LinearExpression( aux_terms.concat([refined_exp_list[i]]) );

            if (aux.getScore() > best.getScore()){
                best = aux;
                refined_exp_list.splice(i, 1);
            }
        } //fim da greedy search
        
        best.simplify(threshold);
        children.push(best);  
    }

    if (children.length>0) 
        return children;
    else
        return [leaf];
}


// MAIN---------------------------------------------------------------------- //
function run_SymTree(){

    //laço principal da SymTree

    //root <- LinearExpression(x);
    var root = new LinearExpression(rootTerms());

    //leaves <- root
    var leaves = [root];

    //while criteria not met
    var gen=-1;
    var nOfGens = 3;

    while (++gen<nOfGens){

        var nodes = [ ];

        //for leaf in leaves
        for (var i=0; i<leaves.length; i++){
            nodes.push.apply(nodes, expand(leaves[i], 0.0001, gen>1, gen>2));
        }

        //leaves <- nodes
        leaves = nodes;

        //busca pelo melhor resultado (critério de parada)
        var best = leaves[0];
        
        for (var i=1; i<leaves.length; i++){
            if (leaves[i].getScore()>best.getScore()){
                best = leaves[i];
            }
        }

        if (best.getScore()==1){
            document.getElementById("results").innerHTML="<p>A busca encontrou uma equação que descreve perfeitamente os pontos de entrada:</p>";
            document.getElementById("results").innerHTML+="<p><pre>Expressão:"+ best.getLinearExpression_d()+ "</p><p>Score: "+best.getScore()+"<p>";
            break;
        }
        if (gen==nOfGens-1){
            document.getElementById("results").innerHTML="<p>A busca não encontrou uma equação perfeita. A mais próxima foi:</p>";
            document.getElementById("results").innerHTML+="<p><pre>Expressão:"+ best.getLinearExpression_d()+ "</p><p>Score: "+best.getScore()+"<p>";
        }
    }
}
