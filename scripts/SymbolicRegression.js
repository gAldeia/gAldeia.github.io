//NEW-SymbolicRegression.js


//DETALHES:
//TUDO deve seguir a regra (lei universal da prevenção de problemas): "sempre que recebe, copia. sempre que retorna, envia cópia."
//PADRÃO ES6: não sei se todo browser suporta. PODE GERAR ERRO.
//atributos modificáveis são publicos (modificar na fonte). para pegar cópias, existem o método copy em todas as classes que podem ser copiadas. USAR ELE para não infringir a LEI UNIVERSAL DA PREVENÇÃO DE PROBLEMAS.
//coeficientes são vinculados com os termos, já que cada termpo sempre terá um coeficiente
//ERROS são notificados com console.error.


//--CLASSES DA REGRESSÃO:-----------------------------------------------------//
//classes que compôe a regressão:
//  -IT(estrutura de dados que são usadas nos termpos, "Iteraction Transformation")
//  -LE(expressão linear, "Linear Expression")
//classes auxiliares essenciais:
//  -OP(classe estática de operadores, "Operators")
//  -LR(classe estática que guarda os métodos de regressão linear)
//  -TermManager(classe que faz operações importantes sobre termos)
//classes principais:
//  -SymTree;
//  -IT_LS;
//  -IT_ES;


class OP{
    static id(){
        return 'id';
    };
    static nextOp(op, n){
        let ops = ['id', 'sin', 'cos', 'tan', 'abs', 'sqrt', 'exp', 'log'];
        return ops[(ops.indexOf(op)+n)%ops.length];
    };
    static rndOp(){
        let ops = ['id', 'sin', 'cos', 'tan', 'abs', 'sqrt', 'exp', 'log'];
        return ops[Math.floor(Math.random() * (-7 + 1)) + 7];
    };
    static length(){
        return 8;
    };
    static solve(op, value){
        if (op==='id')
            return value;
        else if (op==='sin')
            return Math.sin(value);
        else if (op==='cos')
            return Math.cos(value);
        else if (op==='tan')
            return Math.tan(value);
        else if (op==='abs')
            return value<0? -value : value;
        else if (op==='sqrt')
            return value<0? 0 : Math.sqrt(value);
        else if (op==='exp'){
            if (value>=300)
                return Math.exp(300);
            return Math.exp(value);
        }
        else if (op==='log')
            return value<=0? 0 : Math.log(value);
        console.error('PROBLEMA EM SOLVE OP');
        return 0;
    };
    static isOp(op){
        let ops = ['id', 'sin', 'cos', 'tan', 'abs', 'sqrt', 'exp', 'log'];
        return ops.indexOf(op) == -1 ? false : true;
    };
}


class TermManager{
    static rootTerms(){
        let terms = [ ];

        for(let i=0; i<inputPoints[0].x.length; i++){
            let aux = [ ];
            for (let j=0; j<inputPoints[0].x.length; j++)
                aux.push(i==j? 1 : 0);
            terms.push(new IT(aux, OP.id()));
        }
        return terms;
    };
    static rndTerms(qtd){
        let terms = [ ];
        
        for (let i=0; i<qtd; i++){
            let aux = [ ];
            for (let j=0; j< inputPoints[0].x.length; j++){
                aux.push( Math.floor(Math.random()*5) -2);
            }
            terms.push(new IT(aux, OP.rndOp()) );
        }
        return terms;
    };
    static createLE(terms, inputPoints){
        let aux = new LE(terms);
        LR.adjustCoeffs(aux, inputPoints);
        
        return aux;
    };
    static vSum(vector1, vector2){
        //soma vetorial
        let vector1Copy = vector1.slice(0);
        let vector2Copy = vector2.slice(0);
        let aux = [ ];
    
        for(let i=0; i<vector1Copy.length; i++){
            aux.push(vector1Copy[i]+vector2Copy[i]);
        }
        return aux;
    };
    static vSub(vector1, vector2){
        //subtração vetorial
        let vector1Copy = vector1.slice(0);
        let vector2Copy = vector2.slice(0);
        let aux = [ ];
    
        for(let i=0; i<vector1Copy.length; i++){
            aux.push(vector1Copy[i]-vector2Copy[i]);
        }
        return aux;
    };
}


class LR{
    static gradientDescent(LE, inputPoints, numIterations){
        let iteration = -1;
        let alpha = 0.001;
        let tolerance = 0.0002;
        
        while(++iteration<numIterations){
            for (let i=0; i<inputPoints.length; i++){
                let guess = 0.0;

                for (let j=0; j<LE.terms.length; j++){
                    guess += LE.terms[j].evaluate(inputPoints[i]);
                }

                let error = inputPoints[i].y - guess;

                if ( Math.abs(error)<tolerance ){//critério de parada
                    return;
                }
                
                for (let j=LE.terms.length-1; j>=0; j--){
                    //ajustes dos learningRates
                    LE.terms[j].coeff += alpha*LE.terms[j].evaluate(inputPoints[i])*error;
                    if (Math.abs(LE.terms[j].coeff>100) && LE.terms.length>1){
                        LE.terms.splice(j, 1);
                    }
                }
            }
        }
    };
    static improvedGradientDescent(LE, inputPoints, numIterations){
        let iteration = -1;
        let alpha = 0.001;
        let tolerance = 0.0002;
        
        while(++iteration<numIterations){
            for (let i=0; i<inputPoints.length; i++){
                let guess = 0.0;

                for (let j=0; j<LE.terms.length; j++){
                    guess += LE.terms[j].evaluate(inputPoints[i]);
                }

                let error = inputPoints[i].y - guess;

                if ( Math.abs(error)<tolerance ){//critério de parada
                    return;
                }
                
                for (let j=LE.terms.length-1; j>=0; j--){

                    let update = LE.terms[j].coeff + alpha*LE.terms[j].evaluate(inputPoints[i])*error;

                    if (update >0.1*alpha)
                        update -= 0.1*alpha;
                    else if (update < -0.1*alpha)
                        update += 0.1*alpha;
                    else
                        update = 0.0;

                    LE.terms[j].coeff = update;

                    if (Math.abs(LE.terms[j].coeff>100) && LE.terms.length>1){
                        console.log("corta pra mim");
                        LE.terms.splice(j, 1);
                    }
                }
            }
        }
    };
    static leastSquares(LE, inputPoints){
        let mat = new Array(inputPoints.length);
        let y = new Array(inputPoints.length);

        for (let i=0; i<mat.length; i++){
            mat[i] = new Array(LE.terms.length);
            for(let j=0; j<mat[i].length; j++){
                mat[i][j] = LE.terms[j].evaluate(inputPoints[i])/LE.terms[j].coeff;
            }
            y[i] = [inputPoints[i].y];
        }

        let matT = math.transpose(mat);
        let q1 = math.multiply(matT, mat);

        q1 = math.inv(q1);
        let q2 = math.multiply(matT, y);
        
        let w = math.multiply(q1, q2);

        for(let i=0; i<w.length; i++){
            LE.terms[i].coeff = w[i][0];
        }
    };
    static adjustCoeffs(LE, inputPoints){
        try{
            LR.leastSquares(LE, inputPoints);
        }
        catch(err){
            LR.gradientDescent(LE, inputPoints, 20000);
        }
        LE.evaluate(inputPoints);
    };
}


class IT{
    constructor(exponents, operator){
        //check dos tipos
        if (exponents.constructor != Array)
            console.error('expoente não é array de números');
        if (!OP.isOp(operator))
            console.error('string do operador não existe dentro de OP');

        //TUDO deve seguir a regra: "sempre que recebe, copia. sempre que retorna, envia cópia."
        this.coeff = 1; //TODO TERMO NOVO TEM COEFF = 0.1
        this.exp = exponents.slice(0); //copio o array de exp
        this.op = operator.slice(0);
    };
    printMe_d(){ //imprime o termo sem modificações. usado para comparações entre dois termos (ver se são idênticos)
        let myExp = this.coeff.toFixed(2) + '*([';

        for (let i in this.exp) //maybe
            myExp += 'x' + i + '^' + this.exp[i] + (i==this.exp.length-1? '' : ',');

        return myExp + '], ' + this.op + ')';
    };
    printMe(){ //imprime com marcadores HTML para exibir ao usuário
        let myExp = "";
    
        for (let i in this.exp) //maybe
            if (this.exp[i]!=0){
                if (myExp.length!=0)
                    myExp += '*';
                myExp += 'x' + i + (this.exp[i]==1? '' : '<sup>' + this.exp[i] + '</sup>');
            }
        if (this.op!='id')
            myExp = this.op + '(' + myExp + ')';
        return (this.coeff.toFixed(2) == 1.00? '' : this.coeff.toFixed(2) + '*') + myExp;
    }
    evaluate(DataPoint){
        let value = 1.0;

        for (let i=0; i<this.exp.length; i++)
            value *= Math.pow(DataPoint.x[i], this.exp[i]);
        return this.coeff*OP.solve(this.op, value);
    };
    mutateOp(){
        this.op = OP.rndOp();
    };
    mutateExp(){
        //aplica mutação em só um exp, sorteado aleatóriamente
        let index = Math.floor( Math.random()*(this.exp.length-1) );
        //sorteia 1 ou -1
        let toAdd = (Math.random()>0.5 ? -1 : 1);
        //só aplica se não for ficar negativo, e evita exp maiores que 10 para não explodir nada. maybe
        if (this.exp[index] + toAdd>0 && this.exp[index] + toAdd<10)
            this.exp[index] += toAdd;
    };
    isNull(){
        for (let i=0; i<this.exp.length; i++) 
            if (this.exp[i]!=0) return false;

        return true;
    };
    copy(){
        return new IT(this.exp, this.op); //tudo é copiado no construtor, então não há referências aqui
    };
}


class LE{
    constructor(termsToUse){
        if(termsToUse.constructor != Array)
            console.error('termsToUse não é array de IT');
        if (termsToUse[0].constructor != IT)
            console.error('o conteudo de termsToUse não é IT');

        this.score = 0.0;
        this.terms = [ ];

        for (let i in termsToUse){ //maybe
            let push = true;
            for (let j=0; j<this.terms.length && push; j++){
                if (termsToUse[i].printMe_d()===this.terms[j].printMe_d())
                    push= false; 
                else{
                    let counter = 0;
                    for(let k=0; k<inputPoints.length; k++){
                        let myTerm = this.terms[j].evaluate(inputPoints[k])/this.terms[j].coeff;
                        let candidate = termsToUse[i].evaluate(inputPoints[k])/termsToUse[i].coeff;

                        if (myTerm==candidate) counter++;
                        else break;
                    }
                    push = !(counter==inputPoints.length);
                }
            }
            if (push && !termsToUse[i].isNull())
                this.terms.push(termsToUse[i].copy());
        }

        if (this.terms.length==0)
            this.terms = TermManager.rootTerms();
    };
    printMe(){
        let myExp = '';

        for (let i in this.terms)
            myExp += this.terms[i].printMe() + (i==this.terms.length-1? '' : ' + ');

        return myExp;
    };
    evaluate(inputPoints){
        let mae = 0.0;

        for(let i=0; i<inputPoints.length; i++){
            let aux = 0.0;

            for(let j=0; j<this.terms.length; j++){
                aux += this.terms[j].evaluate(inputPoints[i]);
            }
            mae += Math.abs(aux -inputPoints[i].y);
        }
        mae = mae/inputPoints.length;

        if (isFinite(mae)){
            this.score = 1/(1+mae);
        }
        else{
            console.error("MAE não é finito!!");
            this.score = 0.0;
        }
        return mae;
    };
    simplify(threshold){
        let newTerms = [ ];
        for (let i=0; i<this.terms.length; i++){
            if (Math.abs(this.terms[i].coeff)>threshold && !this.terms[i].isNull()){
                newTerms.push(this.terms[i]);
            }
        }
        this.terms = newTerms; //só troca a referência. isso não é feito no construtor pq eventualmente pode acontecer de criar um termo com tudo nulo. 

        if (this.terms.length==0){
            console.error("expressão simplificada ficou sem nenhum termo! inserindo root no lugar");
            this.terms = TermManager.rootTerms();
        }
        LR.adjustCoeffs(this, inputPoints);
    };
    copy(){
        let copies = [ ];
        for (let i=0; i<this.terms.length; i++){
            copies.push(this.terms[i].copy());
        }
        return copies; //TODO TERMO NOVO TEM COEFF AJUSTADO NO CONSTRUTOR
    };
}


class IT_ES{
    constructor(popSize, LESize, growthSize, selectedSize, generations){ //LES e growth precisam ser múltiplos!
        this.pop = [ ];
        this.parents = [ ];
        this.size = popSize;
        
        for(let i=1; i<=this.size; i++){
            let aux = TermManager.createLE(TermManager.rndTerms(LESize), inputPoints);
            this.pop.push(aux);

            if (i%(this.size/growthSize)==0){
                LESize+=1;
            }
        }

        for(let i=0; i<generations; i++){
            this.tournamentSelection(selectedSize);
            this.mutateParents();
            this.childTournamentSelection();
        }

        return this.bestCandidate();
    };
    printMe(){
        console.log("pop:");
        for(let i=0; i<this.size; i++){
            console.log(this.pop[i].printMe());
        }
        console.log("parents:");
        for(let i=0; i<this.parents.length; i++){
            console.log(this.parents[i].printMe());
        }  
    };
    tournamentSelection(selected){
        this.parents = [ ];

        for(let i=0; i<selected; i++){
            let winner = this.pop[Math.floor( Math.random()*(this.pop.length-1) )];

            for(let j=0; j<10; j++){ //10 disputas por torneio
                let index = Math.floor( Math.random()*(this.pop.length-1) );

                winner = winner.score > this.pop[index].score ? winner : this.pop[index];
            }
            this.parents.push(TermManager.createLE(winner.copy(), inputPoints));
        }
    };
    mutateParents(){

        for (let i=0; i<this.parents.length; i++){
            let index = Math.floor( Math.random()*(this.parents[i].terms.length-1) );

            if (Math.random()>0.5){//vai mutar o op
                this.parents[i].terms[index].mutateOp();
            }
            else{
                this.parents[i].terms[index].mutateExp();
            }
            LR.adjustCoeffs(this.parents[i], inputPoints);
        }
    };
    childTournamentSelection(){
        this.pop = [ ];

        for(let i=0; i<this.size; i++){
            let winner = this.parents[Math.floor( Math.random()*(this.parents.length-1) )];

            for(let j=0; j<10; j++){ //10 disputas por torneio
                let index = Math.floor( Math.random()*(this.parents.length-1) );

                winner = winner.score > this.parents[index].score ? winner : this.parents[index];
            }
            this.pop.push(TermManager.createLE(winner.copy(), inputPoints));
        }
    };
    bestCandidate(){
        let bestExpression = this.pop[0];

        for (let i=1; i<this.pop.length; i++){
            if ( this.pop[i].score>bestExpression.score ){
                bestExpression = this.pop[i];
            }
        }
        return bestExpression;
    };
}


class IT_LS{
    constructor(popSize, LESize, growthSize, maxIterations){
        this.pop = [ ];
        this.size = popSize;
        
        for(let i=1; i<=this.size; i++){
            let aux = TermManager.createLE(TermManager.rndTerms(LESize), inputPoints);
            this.pop.push(aux);

            if (i%(this.size/growthSize)==0){
                LESize+=1;
            }
        }

        let previous = this.bestCandidate();
        let counter = 0;
        let BEST = undefined;

        do{
            BEST = this.localSearch(inputPoints);
        } while(previous.score!=BEST.score && counter++ < maxIterations);

        return BEST;
    };
    bestCandidate(){
        let bestExpression = this.pop[0];

        for (let i=1; i<this.pop.length; i++){
            if ( this.pop[i].score>bestExpression.score ){
                bestExpression = this.pop[i];
            }
        }
        let copied = TermManager.createLE(bestExpression.copy(), inputPoints);

        return copied;
    };
    localSearch(inputPoints){
        let candidates = [ ];

        //percorre termo a termo fazendo todas as mudanças possíveis no operador
        //de cada um e guarda as expressões de melhor score para comparar no
        //final.
        let bestExpression = this.bestCandidate();

        for (let i=0; i<bestExpression.terms.length; i++){
            let auxTerms = bestExpression.copy();

            for (let j=0; j<=OP.length(); j++){
                auxTerms[i].op = OP.nextOp(auxTerms[i].op, 1);
                let auxLE = TermManager.createLE(auxTerms, inputPoints);

                if (auxLE.score > bestExpression.score)
                    candidates.push(auxLE);

                for (let k=0; k<auxTerms[i].exp.length; k++){ //percorre cada exp   
                    //limite máximo do expoente
                    if (auxTerms[i].exp[k]<5){
                        auxTerms[i].exp[k] +=1;
                        auxLE = TermManager.createLE(auxTerms, inputPoints);
    
                        if (auxLE.score > bestExpression.score)
                            candidates.push(auxLE);
                    }
                    //limite mínimo do expoente
                    if (auxTerms[i].exp[k]>-5){
                        auxTerms[i].exp[k] -= 2;
                        auxLE = TermManager.createLE(auxTerms, inputPoints);
    
                        if (auxLE.score > bestExpression.score)
                            candidates.push(auxLE);
                    }
                }
            }
        }
        
        for (let i=0; i<candidates.length; i++)
            if ( candidates[i].score>bestExpression.score )
                bestExpression = candidates[i];
        this.pop.push(bestExpression);

        return bestExpression;
    };
}


class SymTree{
    constructor(generations, threshold, minI, minT){
        let gen = -1;
        
        let leaves = [TermManager.createLE(TermManager.rootTerms(), inputPoints)];
        let BEST = leaves[0];
        let previousBEST = BEST;

        while (++gen<generations){
            let nodes = [ ];
            
            //for leaf in leaves
            for (let i=0; i<leaves.length; i++){
                nodes.push.apply(nodes, this.expand(leaves[i], threshold, (gen>=minI), (gen>=minT)));
            }
    
            //leaves <- nodes
            leaves = nodes;
    
            for (let i=0; i<leaves.length; i++){
                if (leaves[i].score>BEST.score){
                    BEST = leaves[i];
                }
            }
            if (BEST.score==previousBEST.score) //não houve melhoria, retorna
                return BEST;
            else
                previousBEST = BEST;
        }
        return BEST;
    };
    interaction(leaf){
        let result = [ ];
    
        for (let i=0; i<leaf.terms.length; i++){
            for (let j=i; j<leaf.terms.length; j++){
                result.push( new IT(TermManager.vSum(leaf.terms[i].exp, leaf.terms[j].exp), OP.id()) );
            }
        }
        return result;
    };
    inverse(leaf){
        let result = [ ];
        for (let i=0; i<leaf.terms.length; i++){
            for (let j=i; j<leaf.terms.length; j++){
                result.push( new IT(TermManager.vSub(leaf.terms[i].exp, leaf.terms[j].exp), OP.id()) );
            }
        }
        return result;
    };
    transformation(leaf){
        let result = [ ];
        for (let i=0; i<leaf.terms.length; i++){
            for (let j=1; j<OP.length(); j++){
                result.push( new IT(leaf.terms[i].exp, OP.nextOp(leaf.terms[i].op, j)) );
            }
        }
        return result;
    };
    expandedList(leaf, minI, minT){
        let exp_list = [ ];

        exp_list.push.apply(exp_list, this.interaction(leaf));
        if (minI)
            exp_list.push.apply(exp_list, this.inverse(leaf));
        if (minT)
            exp_list.push.apply(exp_list, this.transformation(leaf));

        return exp_list;
    };
    expand(leaf, threshold, minI, minT){
        //list <- interaction U inverse U transformation
        let exp_list = this.expandedList(leaf, minI, minT);
    
        //terms <- [term e Terms if score(node + term) > score(node)]
        let refined_exp_list = [ ];
    
        for (let i=0; i<exp_list.length; i++){
            let aux_terms = leaf.copy();
            aux_terms = aux_terms.concat(exp_list[i].copy());
            let aux = TermManager.createLE(aux_terms, inputPoints);
            if (aux.score > leaf.score){//score é calculado no construtor
                refined_exp_list.push(exp_list[i].copy());
            }
        }
    
        let children = [ ];
    
        while (refined_exp_list.length>0){
    
            //esta seria a greedy search
            let best = leaf;
    
            for(let i=refined_exp_list.length-1; i>=0; i--){
                let aux_terms = best.copy();
                aux_terms = aux_terms.concat(refined_exp_list[i].copy());
                let aux = TermManager.createLE(aux_terms, inputPoints);
    
                if (aux.score > best.score){
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
}

//--MÉTODO PRINCIPAL----------------------------------------------------------//

function run_regression(algorithm){
    if (inputPoints[0]===undefined){
        document.getElementById("results").innerHTML="<div class='alert alert-danger'><p class='text-justify'><strong>Atenção!</strong> Você não enviou nenhuma entrada de dados para o site!</p></div>";
        return;
    }

    let expression = undefined;

    if (algorithm==="ITLS")
        expression = new IT_LS(150, 1, 3, 50);
    else if (algorithm==="ITES")
        expression = new IT_ES(150, 1, 3, 45, 50);
    else if (algorithm==="SymTree")
        expression = new SymTree(8, 0.05, 1, 1);
    else
        console.error("método inválido");

    expression.simplify(0.05);

    let expressionString = expression.printMe();
    for(let i=0; i<labels.length; i++){
        expressionString = expressionString.split("x"+i).join(labels[i]);
    }

    document.getElementById("results").innerHTML="<p>O melhor candidato encontrado foi:</p>";
    document.getElementById("results").innerHTML+="<p><pre>Expressão:"+ expressionString+ "</p><p>Score: "+expression.score+"<p>";
}