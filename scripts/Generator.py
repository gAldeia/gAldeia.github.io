import numpy as np

F = np.arange(10, 200, 7)  # forca costuma variar de 0 a 1000 em multiplos de 10
ds   = np.arange(10, 100, 5) # distancia pode ser de 10 a 100 metros
V = np.arange(10, 150, 2)
cosT = np.random.uniform(-1, 1, (100,)) # cosseno sao valores de -1 a 1

for i in range(len(cosT)):
    cosT[i] = round(cosT[i], 2)

# gera uma permutacao aleatoria dos elementos gerados
p1 = np.random.permutation(F)
p2 = np.random.permutation(ds)
p3 = np.random.permutation(cosT)
p4 = np.random.permutation(V)

c = float(299792458)
# menor tamanho entre os vetores
l = min(len(p1), len(p2), len(p3))

# calcula W
W  =  p1[:l]*p2[:l]*p3[:l]
print "tabela:"
# imprime
for i in range(l):
    print p1[i], p2[i], p3[i], W[i]


    
print "\nSITE:"
# imprime
for i in range(l):
    print "<tr><td>" +  str(p1[i]) + "</td><td>"+ str(p2[i]) + "</td><td>" + str(p3[i]) + "</td><td>"  + str(W[i]) +  "</td></tr>"