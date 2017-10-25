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

    var exp = exponents;
    var op = operation;

    return {
        getTerm_d : function(){
            
            //retorna uma string contendo a expressão.

            var term = op + "(";
            for(var i=0; i<exponents.length; i++){
                term += "x" + i + "^" + exp[i] + (i<exponents.length-1? " * " : "");
            }
            return term + ")";
        },

        getExp : function(){
            return exp;
        },

        getOp : function(){
            return op;
        },

        evaluate : function(DataPoint){

            //recebe um ponto (DataPoint) e calcula o valor da função para os dados valores de x

            var value = 1.0;

            for(var i=0; i<exponents.length; i++){
                value *= Math.pow(DataPoint.x[i], exp[i]);
            }
            return Operator.solve(op, value);
        },
    }
}

var LinearExpression = function(termsToUse){

    //construtor cria uma cópia de todos os termos passados.

    //variaveis privadas
    var coefficients = [ ];
    var terms = termsToUse;
    var score = 0.0;

    //métodos internos
    var adjustCoefficients = function(inputPoints, numIterations){
        
        //ajusta os parâmetros, minimizando a soma quadrática dos erros
        //cada termo tem seu próprio learning rate
        var learningRates = [ ];
        var termsValues = [ ];
        var prevTermsValues = [ ];

        //coloca todos os coeficientes no mesmo valor inicial
        for(var i=0; i<coefficients.length; i++){
            learningRates.push(0.1);
            prevTermsValues.push(0.0);
            termsValues.push(0.0);
        }

        //numero de iterações
        for(var i=0; i<numIterations; i++){

            for (var j=0; j<inputPoints.length; j++){
                var result = 0.0;

                for (k=0; k<terms.length; k++){
                    termsValues[k] = terms[k].evaluate(inputPoints[j])*coefficients[k];

                    result += termsValues[k];
                }

                var error = result - inputPoints[j].y;

                for (var k=0; k<terms.length; k++){
                    coefficients[k] -= (learningRates[k]*terms[k].evaluate(inputPoints[j])*error);

                    //ajustes dos learningRates
                    if (prevTermsValues[k]*termsValues[k]>0){
                        learningRates[k]  *= 0.98;
                    }
                    else if (prevTermsValues[k]*termsValues[k]<0){
                        learningRates[k]  *= 1.02;
                    }
                }
                prevTermsValues = termsValues;
            }
        }
    };

    var calculateMAE = function(inputPoints){
        
        //calcula o mse.
        var mae = 0.0;

        for(var i=0; i< inputPoints.length; i++){
            var aux = 0.0;

            for(var j=0; j<terms.length; j++){
                aux+= coefficients[j]*terms[j].evaluate(inputPoints[i]);
            }
            mae += Math.abs(inputPoints[i].y - aux);
        }

        if (!isFinite(mae) || isNaN(mae)){
            mae = Math.exp(300);
            score = 0.0;
        }
        else {
            mae = mae/inputPoints.length;
            score = 1/ (1+ mae);
        }

        return mae;
    };

    //criando todas as cópias
    for (var i=0; i<terms.length; i++){
        coefficients.push(1.0);
    }

    //ajuste inicial (executado no construtor)
    adjustCoefficients(inputPoints, 500);
    calculateMAE(inputPoints);

    return {
        getLinearExpression_d : function(){
            
            //retorna uma string da expressão

            var linearExpression = "";
            for(var i=0; i<terms.length; i++)
                linearExpression += coefficients[i].toFixed(2) + "*" + terms[i].getTerm_d() + (i<terms.length-1? "+" : "");

            return linearExpression;
        },

        evaluateScore : function(inputPoints){
            adjustCoefficients(inputPoints, 500);
            calculateMAE(inputPoints);

            return score;
        },

        simplify : function(threshold){
            
            //percorre uma expressão removendo todo termo de coeficiente menor
            //que o valor de threshold
        
            var i = -1;
        
            while (++i < coefficients.length){
                if (Math.abs(coefficients[i]) <= threshold){
                    coefficients.splice(i, 1);
                    terms.splice(i--, 1);
                }
            }
            this.evaluateScore(inputPoints);
        },

        interaction : function(){
        
            var result = [ ];
        
            for (var i=0; i<terms.length; i++){
                for (var j=i; j<terms.length; j++){
                    result.push( new Term(vSum(terms[i].getExp(), terms[j].getExp()), Operator.id) );
                }
            }
            return result;
        },

        inverse : function(){
            var result = [ ];
        
            for (var i=0; i<terms.length; i++){
                for (var j=i; j<terms.length; j++){
                    result.push(new Term(vSub(terms[i].getExp(), terms[j].getExp()), Operator.id) );
                }
            }
            return result;
        },

        transformation : function(){
            
            var result = [ ];

            for (var i=0; i<terms.length; i++){
                for (var j=1; j<Operator.length; j++){
                    result.push( new Term(terms[i].getExp(), Operator.nextN(terms[i].getOp(), j) ) );
                }
            }
            
            return result;
        },

        getScore : function(){
            return score;
        },

        getCoefficients : function(){
            return coefficients;
        },

        getTerms : function(){
            return terms;
        }
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

         //esta seria a greedy search    
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
    var nOfGens = 6;

    while (++gen<nOfGens){

        var nodes = [ ];

        //for leaf in leaves
        for (var i=0; i<leaves.length; i++){
            nodes.push.apply(nodes, expand(leaves[i], 0.1, gen>1, gen>3));
        }

        //leaves <- nodes
        leaves = nodes;

        //busca pelo melhor resultado (critério de parada)
        var best = leaves[0];
        
        for (var i=0; i<leaves.length; i++){
            if (leaves[i].getScore()>best.getScore()){
                best = leaves[i];
            }
        }

        if (best.getScore()==1){
            document.getElementById("results").innerHTML="<p>A busca encontrou uma equação que descreve perfeitamente os pontos de entrada:</p>";
            document.getElementById("results").innerHTML+="<p><pre>Expressão:"+ best.getLinearExpression_d()+ "</p><p>Score:"+best.getScore()+"<p>";
            break;
        }
        if (gen==nOfGens-1){
            document.getElementById("results").innerHTML="<p>A busca não encontrou uma equação perfeita. A mais próxima foi:</p>";
            document.getElementById("results").innerHTML+="<p><pre>Expressão:"+ best.getLinearExpression_d()+ "</p><p>Score:"+best.getScore()+"<p>";
        }
    }
}
