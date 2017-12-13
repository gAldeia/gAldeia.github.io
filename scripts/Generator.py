import numpy as np
from math import cos

F = np.arange(10, 1010, 10)  # forca costuma variar de 0 a 1000 em multiplos de 10
ds   = np.arange(10, 100, 5) # distancia pode ser de 10 a 100 metros
V = np.arange(1, 20, 1)
cosT = np.arange(0.01, 6.283184, 0.01) # cosseno sao valores de -1 a 1


# gera uma permutacao aleatoria dos elementos gerados
p1 = np.random.permutation(F)
p2 = np.random.permutation(ds)
p3 = np.random.permutation(cosT)
p4 = np.random.permutation(V)

pcos = [cos(p) for p in p3]

c = float(299792458)
R = 8.314598
# menor tamanho entre os vetores
l = min(len(p1), len(p2), len(p3))
# calcula W
W  =  p1[:l]*p2[:l]*pcos[:l]

print "tabelsa:"
# imprime
for i in range(l):
    print p1[i], p2[i], p3[i], W[i]    

print "\ntabela arredondada:"
# imprime
for i in range(l):
    print "<tr><td>" + str(p1[i]) + "</td><td>" +  str(p2[i])  + "</td><td>"+ str(p3[i]) + "</td><td>" + str(W[i]) + "</td></tr>"

