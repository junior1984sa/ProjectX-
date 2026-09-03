import math
def seg(r,d):
    if d>=r: return 0.0
    return r*r*math.acos(d/r)-d*math.sqrt(max(r*r-d*d,0.0))
def vol_trunc(r1,d,h=1.5,n=200000):
    # volume removido por um plano vertical a distancia d do eixo
    s=0.0; dz=h/n
    for i in range(n):
        z=(i+0.5)*dz
        s+=seg(r1+z,d)*dz
    return s
def lens(r,dist):
    # area da lente entre dois circulos de raio r com centros a 'dist'
    if dist>=2*r: return 0.0
    return 2*r*r*math.acos(dist/(2*r))-(dist/2)*math.sqrt(max(4*r*r-dist*dist,0.0))
def vol_over(r1,dist,h=1.5,n=200000):
    s=0.0; dz=h/n
    for i in range(n):
        z=(i+0.5)*dz
        s+=lens(r1+z,dist)*dz
    return s

R1=10.85
print("LINHA 815  (R_fundo=%.2f, R_topo=%.2f, h=1,50)"%(R1,R1+1.5))
print("  sobreposicao entre cones adjacentes (esp. 24,00): %.2f m3/par x 3 = %.2f m3"%(vol_over(R1,24.0), 3*vol_over(R1,24.0)))
for d,desc in [(11.85,'extremidade esquerda'),(11.15,'extremidade direita'),(10.97,'lateral sul (cota 10,97) - por tanque'),(14.98,'lateral norte (cota 14,98)')]:
    v=vol_trunc(R1,d)
    print("  truncamento a %5.2f m do eixo (%s): %6.2f m3"%(d,desc,v))
sul=4*vol_trunc(R1,10.97)
print("  -> se a cota 10,97 truncar os 4 tanques: %.2f m3"%sul)
tot=3*vol_over(R1,24.0)+vol_trunc(R1,11.85)+vol_trunc(R1,11.15)+sul
print("  SOMA dos mecanismos identificados: %.2f m3   (desvio a explicar: 47,71 m3)"%tot)
print()
print("LINHA 818 (R_fundo=12,78): truncamento a 13,73 e 13,77 -> %.2f + %.2f = %.2f m3"%(
    vol_trunc(12.78,13.73), vol_trunc(12.78,13.77), vol_trunc(12.78,13.73)+vol_trunc(12.78,13.77)))
print("  sobreposicao (esp. 27,50): %.2f m3/par x3 = %.2f"%(vol_over(12.78,27.5),3*vol_over(12.78,27.5)))
print()
print("LINHA 816/817 (R_fundo=13,71): sobreposicao (esp 29,00): %.2f m3/par x3 = %.2f"%(vol_over(13.71,29.0),3*vol_over(13.71,29.0)))
print()
print("Retro-calculo do raio que reproduz o REATERRO do desenho da linha 815:")
import bisect
def vline(r): return 4*(math.pi*1.5/3*(r*r+r*(r+1.5)+(r+1.5)**2))
lo,hi=10.0,11.5
for _ in range(80):
    mid=(lo+hi)/2
    if vline(mid)<2492.22: lo=mid
    else: hi=mid
print("  R = %.4f m  (cotado: 10,85)  -> diferenca %.3f m"%(lo,10.85-lo))
