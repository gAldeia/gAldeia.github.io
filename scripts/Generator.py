import numpy as np
from math import cos

# conjuntos de permutacoes aleatorias
p1 = np.random.permutation( np.arange(1, 10, 1) )
p2 = np.random.permutation( np.arange(1, 20, 2) )
p3 = np.random.permutation( np.arange(1, 40, 3) )
cos = np.random.permutation( np.arange(-1, 1, 0.1) )

#constantes
c = 299792458.0 #velocidade luz
R = 8.314598 #constante dos gases perfeitos
pi = 3.141592 #valor de pi
g = 9.81 #aceleração da gravidade 

# menor tamanho entre os vetores
l = min(len(p1), len(p2), len(cos))

# funcao a ser criada W
W  =  p1[:l]*p2[:l]*cos[:l]

print "Tabela de testes:"
for i in range(l):
    print p1[i], p2[i], W[i]    

print "\nTabela HTML:"
for i in range(l):
    print "<tr><td>"+str(p1[i])+"</td><td>"+ str(p2[i])+"</td><td>"+str(W[i])+"</td></tr>"