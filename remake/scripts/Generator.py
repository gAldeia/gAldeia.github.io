import numpy as np
from math import cos
from math import log

# conjuntos de permutacoes aleatorias
p1 = np.random.permutation( np.arange(1.0e-8, 1.0e-5, 1.0e-8) )
p2 = np.random.permutation(  np.arange(1.0e-12, 1.0e-10, 1.0e-12)  )
p3 = np.random.permutation( np.arange(1, 10, 0.25) )

cos = np.random.permutation( np.arange(-1, 1, 0.05) )

#constantes
c = 299792458.0 #velocidade luz
c2 = 8.9875518e+16 #luz ao quadrado
R = 8.314598 #constante dos gases perfeitos
pi = 3.141592 #valor de pi
g = 9.807 #aceleracao da gravidade 

# menor tamanho entre os vetores
l = min(len(p1), len(p2));

# funcao a ser criada W
W  = p1[:l]/p2[:l]
for i in range(l):
    W[i] = 10*log(W[i])

print "Tabela de testes:"
for i in range(l):
    print p1[i], p2[i], W[i]

print "\nTabela HTML:"
for i in range(l):
    print "<tr><td>"+str(p1[i])+"</td><td>"+str(p2[i])+"</td><td>"+str(W[i])+"</td></tr>"