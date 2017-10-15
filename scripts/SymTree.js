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
    var adjustCoefficients = function(inputPoints, numIterations, learningRate, threshold){
        
        //ajusta os parâmetros, minimizando a soma quadrática dos erros

        //coloca todos os coeficientes no mesmo valor inicial
        for(var i=0; i<coefficients.length; i++){
            coefficients[i]=1;
        }

        //numero de iterações
        for(var i=0; i<numIterations; i++){

            //percorre cada um dos termos que compoe a expressão
            for(var j=0; j<terms.length; j++){

                //não faz o ajuste caso o coef já seja menor que o limite
                if (coefficients[j] <= threshold) continue;

                var result = 0.0;

                for(var k=0; k<inputPoints.length; k++){

                    //calcula o valor do termo isolado
                    aux = terms[j].evaluate(inputPoints[k]);

                    //mede o quão distante este está do ponto de entrada
                    //com o seu respectivo coeficiente.
                    result += (aux*coefficients[j] - inputPoints[k].y)*aux*2;
                }

                //tira a média da soma quadrática dos erros
                result /= inputPoints.length;

                //aplica o gradiente descendente 
                coefficients[j] -= learningRate*result;

                //caso o coeficiente cresça tanto que vire NaN ou infinito
                if (isNaN(coefficients[j]) || !isFinite(coefficients[j]))
                    coefficients[j] = 1;
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
        mae = mae/inputPoints.length;

        if (!isFinite(mae) || isNaN(mae))
            mae = Math.exp(300);

        score = 1/ (1+ mae);

        return mae;
    };

    //criando todas as cópias
    for (var i=0; i<terms.length; i++){
        coefficients.push(1.0);
    }

    //ajuste inicial (executado no construtor)
    adjustCoefficients(inputPoints, 1000, 0.001, 0.05);
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
            adjustCoefficients(inputPoints, 1000, 0.01, 0.005);
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
                    result.push( new Term(vSum(terms[i].getExp(), terms[j].getExp()), "id") );
                }
            }
            return result;
        },

        inverse : function(minI){
            
            if (!minI) return [ ];

            var result = [ ];
        
            for (var i=0; i<terms.length; i++){
                for (var j=i; j<terms.length; j++){
                    result.push(new Term(vSub(terms[i].getExp(), terms[j].getExp()), "id") );
                }
            }
            return result;
        },

        transformation : function(minT){
            
            if (!minT) return [ ];

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

function expand(leaf, threshold, minI, minT){

    console.log("entrei no expandir");

    //list <- interaction U inverse U transformation
    var interaction = leaf.interaction();
    var inverse = leaf.inverse();
    var transf = leaf.transformation();
    var exp_list = [ ];

    exp_list = exp_list.concat(leaf.interaction());
    exp_list = exp_list.concat(leaf.inverse(minI));
    exp_list = exp_list.concat(leaf.transformation(minT)); 

    //terms <- [term e Terms if score(node + term) > score(node)]
    var refined_exp_list = [ ];
    for (var i=0; i<exp_list.length; i++){
        var auxTerms = leaf.getTerms().concat([exp_list[i]]);
        var aux = new LinearExpression(auxTerms);
        if (aux.getScore() > leaf.getScore()){
            refined_exp_list.push(exp_list[i]);
        }
    }

    var children = [ ];

    //remove dos elementos para o greedySearch aqueles que já estão na
    //expressão
    var toCheck = leaf.getTerms();
    for (var i=0; i<toCheck.length; i++){
        var index = refined_exp_list.indexOf(toCheck[i]);
        if (index!=-1){
            refined_exp_list.slice(index, 1);
        }
    }

    //esta seria a greedy search
    while (refined_exp_list.length>0){
        var best = leaf;

        for(var i=0; i<refined_exp_list.length; i++){
            var aux = new LinearExpression( best.getTerms().concat([refined_exp_list[i]]) );

            if (aux.getScore() > best.getScore()){
                best = aux;
                refined_exp_list.splice(i, 1);
            }
        }
        best.simplify(threshold);
        children.push(best);
    }

    if (children.length>0){
        console.log("saí do expandi, retornando filhos");
        return children;
    }
    else{
        console.log("saí do expandi, mas não retornei filhos");
        return leaf;
    }
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
    while (++gen<6){
        console.log("gen");
        console.log(leaves.length);

        var nodes = [ ];
        //for leaf in leaves
        for (var i=0; i<leaves.length; i++){
            nodes = nodes.concat(expand(leaves[i], 0.1, gen>1, gen>3));
        }

        //leaves <- nodes
        leaves = leaves.concat(nodes);
    }

    //busca pelo melhor resultado
    best = leaves[0];
    
    for (var i=1; i<leaves.length; i++){
        if (leaves[i].getScore()>best.getScore()){
            best = leaves[i];
        }
    }
    alert(best.getLinearExpression_d());
    alert(best.getScore());
}