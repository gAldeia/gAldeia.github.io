//SymbolicRegression.js

//o funcionamento desse script precisa da existência de um vetor de objetos
//do tipo DataPoint, chamado inputPoints. Toda a criação e preparação desse
//vetor é feita no arquivo loadFile.

//todos os algoritmos (IT-LS, SymTree e IT-ES) são baseados na estrutura de 
//dados IT, e as 3 classes implementadas aqui são utilizadas por todos os
//algoritmos.


// --CLASSES DA REGRESSÃO SIMBÓLICA------------------------------------------ //
var OP = {

    ops : ["id", "sin", "cos", "tan", "abs", "sqrt", "exp", "log"],

    length : 8,

    id : "id",

    nextN : function(op, n){
        return OP.ops[(OP.ops.indexOf(op)+n)%OP.length];
    },
    
    rndOp : function(){
        return OP.ops[Math.floor(Math.random() * (-7 + 1)) + 7];
    },

    solve : function(op, value){
            if (op==="id")
                return value;
            else if (op==="sin")
                return Math.sin(value);
            else if (op==="cos")
                return Math.cos(value);
            else if (op==="tan")
                return Math.tan(value);
            else if (op==="abs")
                return Math.abs(value);
            else if (op==="sqrt")
                return value<0? 0 : Math.sqrt(value);
            else if (op==="exp")
                return Math.exp( Math.floor(value) );
            else if (op==="log")
                return value<=0? 0 : Math.log(value);
            alert("PROBLEMA EM SOLVE OP");
            return 0;
        }
}

var Term = function(exponents, operation){

    this.exp = exponents;
    this.op = operation;

    this.evaluate = function(DataPoint){
        //recebe um ponto (DataPoint) e calcula o valor da função para os dados valores de x

        let value = 1.0;
        for(let i=0; i<DataPoint.x.length; i++){
            value *= Math.pow(DataPoint.x[i], this.exp[i]);
        }
        return OP.solve(this.op, value);
    },

    this.getTerm_d = function(){
        //retorna uma string contendo a expressão.

        let term = this.op + "(";
        for(let i=0; i<this.exp.length; i++){
            term += "x" + i + "^" + this.exp[i] + (i<this.exp.length-1? " * " : "");
        }
        return term + ")";
    },

    this.mutateOp = function(){
        this.op = OP.rndOp();
    },

    this.mutateExp = function(){
        let index = Math.floor( Math.random()*(this.exp.length-1) );

        let toAdd = Math.floor( Math.random()*(3) -1 );

        if (this.exp[index] + toAdd>0)
            this.exp[index] += toAdd;
    }

    this.getExp = function(){
        let copy = [ ];
        for(let i=0; i<this.exp.length; i++)
            copy.push(this.exp[i]);
        return copy;
    },

    this.getOp = function(){
        return this.op;
    },

    this.getSize = function(){
        return this.exp.length;
    },

    this.isNull = function(){ //verifica se todos os expoentes são zero
        for (let i=0; i<this.exp.length; i++){
            if (this.exp[i]!=0) return false;
        }
        return true;
    },

    this.copy = function(){
        return new Term(this.getExp(), this.op);
    }
}

var LinearExpression = function(termsToUse){

    this.coefficients = [ ];
    this.terms = [ ];
    this.score = 0.0;

    for (let i=0; i<termsToUse.length; i++){
        let push = true;

        for(let j=0; j<this.terms.length; j++){
            if (termsToUse[i].getTerm_d()===this.terms[j].getTerm_d()){
                push = false;
                break;
            }
        }
        if (push && !termsToUse[i].isNull()){
            this.terms.push(termsToUse[i].copy());
            this.coefficients.push(0.0);
        }
    }
    if (this.terms.length==0)
        this.terms = rootTerms();

    this.getLinearExpression_d = function(){
        
        //retorna uma string da expressão

        let linearExpression = "";
        for(let i=0; i<this.terms.length; i++)
            linearExpression += this.coefficients[i].toFixed(2) + "*" + this.terms[i].getTerm_d() + (i<this.terms.length-1? "+" : "");

        return linearExpression;
    },

    this.adjustCoefficients = function(inputPoints, numIterations){
        
        /* ISSO NÃO FUNCIONA (E CONSEQUENTEMENTE GERA PROBLEMAS)
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

        let iteration = -1;
        let alpha = 0.01/inputPoints.length;
        let prevError = 0;

        numIterations /= inputPoints.length;

        //numero de iterações
        while(++iteration<numIterations){
            for (let i=0; i<inputPoints.length; i++){
                let guess = 0.0;

                for (let j=0; j<this.terms.length; j++){
                    guess += this.coefficients[j]*this.terms[j].evaluate(inputPoints[i]);
                }

                let error = guess - inputPoints[i].y;

                if ( Math.abs(prevError-error)<0.001 ){//critério de parada
                    iteration = numIterations;
                    break;
                }
                else
                    prevError = error;

                ///*
                for (let j=0; j<this.terms.length; j++){
                    //ajustes dos learningRates
                    this.coefficients[j] -= alpha*this.terms[j].evaluate(inputPoints[i])*error;
                    if (this.coefficients[j]>10000)
                        console.log("nao foi");
                }
                //*/
                /*
                for (let j=0; j<this.terms.length; j++){
                    //ajustes dos learningRates
                    let update = this.coefficients[j] - alpha*this.terms[j].evaluate(inputPoints[i])*error;
                    if (update >0.1*alpha)
                        update -= 0.1*alpha;
                    else if (update < -0.1*alpha)
                        update += 0.1*alpha;
                    else
                        update = 0.0;
                    this.coefficients[j] = update;
                    if (this.coefficients[j]>10000)
                        console.log("n foi");
                }
                */
            }
        }
    },

    this.calculateMAE = function(inputPoints){
        //calcula o mae.
        let mae = 0.0;

        for(let i=0; i<inputPoints.length; i++){
            let aux = 0.0;

            for(let j=0; j<this.terms.length; j++){
                aux += this.coefficients[j]*this.terms[j].evaluate(inputPoints[i]);
            }
            mae += Math.abs(inputPoints[i].y - aux);
        }
        mae = mae/inputPoints.length;

        if (isFinite(mae))
            this.score = 1/(1+mae);
        else 
            this.score = 0.0;
        
        return mae;
    },

    this.evaluateScore = function(inputPoints){
        this.adjustCoefficients(inputPoints, 15000);
        this.calculateMAE(inputPoints);

        return this.score;
    },

    this.evaluateScore(inputPoints);

    this.simplify = function(threshold){
        
        //percorre uma expressão removendo todo termo de coeficiente menor
        //que o valor de threshold
    
        let newTerms = [ ];
        let newCoefs = [ ];

        for (let i=0; i<this.terms.length; i++){
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
        let copy = [ ];
        for (let i=0; i<this.coefficients.length; i++){
            copy.push(this.coefficients[i]);
        }
        return copy;
    },

    this.getTerms = function(){
        let copy = [ ];
        for (let i=0; i<this.terms.length; i++){
            copy.push(this.terms[i].copy());
        }
        return copy;
    }
}


// --MÉTODOS AUXILIARES------------------------------------------------------ //
function rootTerms(){
    //cria um grupinho que serve pra inicializar o root
    let terms = [ ];

    for(let i=0; i<inputPoints[0].x.length; i++){
        let aux = [ ];
        for (let j=0; j<inputPoints[0].x.length; j++)
            aux.push(i==j? 1 : 0);
        terms.push(new Term(aux, OP.id) );
    }
    return terms;
}

function rndTerms(howMany){
    //conjunto de termos (que são conjuntos de expoentes)
    let terms = [ ];

    for (let i=0; i<howMany; i++){
        let aux = [ ];
        for (let j=0; j< inputPoints[0].x.length; j++){
            aux.push( Math.floor(Math.random()*4) -2);
        }
        terms.push(new Term(aux, OP.rndOp()) );
    }
    return terms;
}

function vSum(vector1, vector2){
    //soma vetorial
    let aux = [ ];

    for(let i=0; i<vector1.length; i++){
        aux.push(vector1[i]+vector2[i]);
    }
    return aux;
}

function vSub(vector1, vector2){
    //subtração vetorial
    let aux = [ ];

    for(let i=0; i<vector1.length; i++){
        aux.push(vector1[i]-vector2[i]);
    }
    return aux;
}


// --SYMTREE----------------------------------------------------------------- //
var SymTree = function(){
    //transformar symtree num objeto para ter um "namespace"
}

function interaction(leaf){

    let result = [ ];

    for (let i=0; i<leaf.terms.length; i++){
        for (let j=i; j<leaf.terms.length; j++){
            result.push( new Term(vSum(leaf.terms[i].getExp(), leaf.terms[j].getExp()), OP.id) );
        }
    }
    return result;
}

function inverse(leaf){
    let result = [ ];

    for (let i=0; i<leaf.terms.length; i++){
        for (let j=i; j<leaf.terms.length; j++){
            result.push(new Term(vSub(leaf.terms[i].getExp(), leaf.terms[j].getExp()), OP.id) );
        }
    }
    return result;
}

function transformation(leaf){
    
    let result = [ ];

    for (let i=0; i<leaf.terms.length; i++){
        for (let j=1; j<OP.length; j++){
            result.push( new Term(leaf.terms[i].getExp(), OP.nextN(leaf.terms[i].getOp(), j) ) );
        }
    }
    
    return result;
}

function expandedList(leaf, minI, minT){

    //expande todas as operações (sem usar o concat).

    let exp_list = [ ];

    exp_list.push.apply(exp_list, interaction(leaf));
    
    if (minI){
        exp_list.push.apply(exp_list, inverse(leaf));
    }
    if (minT){
        exp_list.push.apply(exp_list, transformation(leaf));
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
    
    /* FICOU REDUNDANTE JÁ QUE A COMPARAÇÃO É FEITA NO CONSTRUTOR DO TERMO
    //remove da exp_list aqueles termos que já estão na expressão
    var toCheck = leaf.getTerms();

    for (var i=0; i<toCheck.length; i++){
        for(var j=refined_exp_list.length-1; j>=0; j--){
            if (toCheck[i].getTerm_d()==refined_exp_list[j].getTerm_d()){ //compara a string de cada um
                refined_exp_list.slice(j, 1);
            }
        }
    }
    */

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


// --IT-LS------------------------------------------------------------------- //
var IT_LS = function(populationSize, expressionSize){

    //"gerenciadora" da população

    this.subjects = [ ];
    this.size = populationSize;
    this.bestExpression = new LinearExpression(rndTerms(expressionSize));
    this.subjects.push(this.bestExpression);

    for(let i=1; i<this.size; i++){
        this.subjects.push( new LinearExpression(rndTerms(expressionSize)) );
        
        if (i%(this.size/4)==0)
            expressionSize++;

        if(this.subjects[i].getScore() > this.bestExpression.getScore())
            this.bestExpression = this.subjects[i];
    }

    this.getBestExpression_d = function(){
        return this.bestExpression.getLinearExpression_d();
    },

    this.getBestExpressionScore_d = function(){
        return this.bestExpression.getScore();
    },

    this.localSearch = function(inputPoints){

        let candidates = [ ];
        let expCandidates = [ ];

        //percorre termo a termo fazendo todas as mudanças possíveis no operador
        //de cada um e guarda as expressões de melhor score para comparar no
        //final.
        let bestExpressionTerms = this.bestExpression.getTerms();

        for (let i=0; i<bestExpressionTerms.length; i++){
            let auxTerms = this.bestExpression.getTerms();

            for (let j=1; j<=OP.length; j++){
                auxTerms[i].op = OP.nextN(bestExpressionTerms[i].getOp(), j);

                let OPSearch = new LinearExpression(auxTerms);

                if (OPSearch.getScore() > this.bestExpression.getScore())
                    candidates.push(OPSearch);
            }
        }

        for(let i=0; i<candidates.length; i++){ //percorre cada candidato
            for (let j=0; j<candidates[i].terms.length; j++){ //percorre cada termo 
                for (let k=0; k<candidates[i].terms[j].exp.length; k++){ //percorre cada exp
                    expCandidates.push(new LinearExpression(candidates[i].getTerms()));

                    //limite máximo do expoente
                    if (candidates[i].terms[j].exp[k]<5){
                        candidates[i].terms[j].exp[k] +=1;
                        expCandidates.push(new LinearExpression(candidates[i].getTerms()));
                    }

                    //limite mínimo do expoente
                    if (candidates[i].terms[j].exp[k]>-5){
                        candidates[i].terms[j].exp[k] -=2;
                        expCandidates.push( new LinearExpression(candidates[i].getTerms()));
                    }
                }
            }
        }

        if (expCandidates.length>0){
            let bestLocalSearch = this.bestExpression;

            for(let i=0; i<expCandidates.length; i++){
                expCandidates[i].simplify(0.01);
                if (expCandidates[i].getScore()>bestLocalSearch.getScore()){
                    bestLocalSearch = expCandidates[i];
                }
            }
            this.bestExpression = bestLocalSearch;
        }
    }
};


// --IT-ES------------------------------------------------------------------- //
var IT_ES = function(populationSize, expressionSize){

    this.subjects = [ ];
    this.parents = [ ];

    this.size = populationSize;

    for(let i=1; i<=this.size; i++){
        this.subjects.push( new LinearExpression(rndTerms(expressionSize)) );
        
        if (i%(this.size/3)==0)
            expressionSize++;
    }

    this.tournamentSelection = function(howMany){
        this.parents = [ ];

        for(let i=0; i<howMany; i++){
            let winner = this.subjects[Math.floor( Math.random()*(this.subjects.length-1) )];

            for(let j=0; j<10; j++){ //5 disputas por torneio
                let index = Math.floor( Math.random()*(this.subjects.length-1) );

                winner = winner.getScore() > this.subjects[index].getScore() ? winner : this.subjects[index];
            }
            this.parents.push(winner);
        }
    },
    
    this.mutateParents = function(mutationRate){
        let auxParents = [ ];

        for (let i=0; i<this.parents.length; i++){
            if (Math.random() < mutationRate){
                let index = Math.floor( Math.random()*(this.parents[i].terms.length-1) );

                if (Math.random()>0.5){//vai mutar o op
                    this.parents[i].terms[index].mutateOp();
                }
                else{
                    this.parents[i].terms[index].mutateExp();
                }
                //é preciso descartar um mutacionado pois recalcular e reajustar
                //tudo gera muitos erros no JS. é melhor criar outro e deixar que o 
                //construtor cuide dos problemas.
            }
            auxParents.push(new LinearExpression(this.parents[i].getTerms()));
        }
        this.parents = auxParents;
    },

    this.childTournamentSelection = function(){
        //faz a seleção e já coloca em subjects. deve sempre existir uma alter-
        //nancia entre o parent selection e o child selection, nunca pulando um
        //dos métodos.

        this.subjects = [ ];

        for(let i=0; i<this.size; i++){
            let winner = this.parents[Math.floor( Math.random()*(this.parents.length-1) )];

            for(let j=0; j<10; j++){
                let index = Math.floor( Math.random()*(this.parents.length-1) );
                winner = winner.getScore() > this.parents[index].getScore() ? winner : this.parents[index];
            }
            this.subjects.push(winner);
        }
    },

    this.iterate = function(nOfParents, mutRate){
        this.tournamentSelection(nOfParents);
        this.mutateParents(mutRate);
        this.childTournamentSelection();
    },

    this.getBestExpression_d = function(){
        let bestExpression = this.subjects[0];

        for (let i=1; i<this.subjects.length; i++){
            if ( this.subjects[i].getScore()>bestExpression.getScore() ){
                bestExpression = this.subjects[i];
            }
        }
        return bestExpression;
    }
}


// --MÉTODOS "MAIN" DE CADA UM DOS ALGORITMOS-------------------------------- //
function run_ITLS(){
    
    if (inputPoints[0]==undefined){
        document.getElementById("results").innerHTML="<div class='alert alert-danger'><p class='text-justify'><strong>Atenção!</strong> Você não enviou nenhuma entrada de dados para o site!</p></div>";
        return;
    }

    var myPop = new IT_LS(200, 1);

    var prevScore;
    var maxIterations = 25;
    var counter = 0;

    document.getElementById("results").innerHTML="<p>População criada. A melhor expressão inicial:</p>";
    document.getElementById("results").innerHTML+="<p><pre>Expressão: "+myPop.getBestExpression_d()+"</p><p>Score: "+myPop.getBestExpressionScore_d()+"</p>";

    do {
        prevScore = myPop.getBestExpressionScore_d();
        myPop.localSearch(inputPoints);
    }while (prevScore != myPop.getBestExpressionScore_d() && counter++ < maxIterations);

    document.getElementById("results").innerHTML+="<p>O algoritmo executou "+(++counter)+" buscas locais, e o resultado foi:</p>";
    document.getElementById("results").innerHTML+="<p><pre>Expressão: "+myPop.getBestExpression_d()+"</p><p>Score: "+myPop.getBestExpressionScore_d()+"</p>";
}

function run_SymTree(){

    if (inputPoints[0]==undefined){
        document.getElementById("results").innerHTML="<div class='alert alert-danger'><p class='text-justify'><strong>Atenção!</strong> Você não enviou nenhuma entrada de dados para o site!</p></div>";
        return;
    }

    //root <- LinearExpression(x);
    let root = new LinearExpression(rootTerms());

    //leaves <- root
    let leaves = [root];

    //while criteria not met
    let gen=-1;
    let nOfGens = 3;

    while (++gen<nOfGens){

        let nodes = [ ];

        //for leaf in leaves
        for (let i=0; i<leaves.length; i++){
            nodes.push.apply(nodes, expand(leaves[i], 0.01, gen>=0, gen>0));
        }

        //leaves <- nodes
        leaves = nodes;

        //busca pelo melhor resultado (critério de parada)
        let best = leaves[0];

        for (let i=0; i<leaves.length; i++){
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

function run_ITES(){
    if (inputPoints[0]==undefined){
        document.getElementById("results").innerHTML="<div class='alert alert-danger'><p class='text-justify'><strong>Atenção!</strong> Você não enviou nenhuma entrada de dados para o site!</p></div>";
        return;
    }

    let ITESpopSize = 150;

    myPop = new IT_ES(ITESpopSize, 1);

    let counter = -1;
    let numIterations = 8;
    let nOfParents = 75;
    let rate = 0.09;

    let bestExpression;

    while(++counter<numIterations){ // || criteria not met
        myPop.iterate(nOfParents, rate);
        bestExpression = myPop.getBestExpression_d();
    }

    document.getElementById("results").innerHTML="<p>A busca encontrou a equação:</p>";
    document.getElementById("results").innerHTML+="<p><pre>Expressão:"+ bestExpression.getLinearExpression_d()+ "</p><p>Score: "+bestExpression.getScore()+"<p>";
}
