/* =========================================================
   WC DEV — PYTHON (trilha em ordem: do básico ao avançado)
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

WCDEV.temas.push(
  {
    id: "py-intro",
    lang: "python",
    titulo: "O que é Python e como instalar",
    chaves: ["o que e python", "instalar python", "baixar python", "como instalo", "onde programar", "rodar python", "executar python", "vscode", "comecar python"],
    resposta: `### O que é Python? 🐍
Python é uma linguagem fácil de ler e muito poderosa. É usada em **automação**, **jogos**, **sites**, **ciência de dados** e **inteligência artificial**.

**Como começar:**
- Baixe em {{python.org}} e instale (no Windows, marque **"Add Python to PATH"**).
- Use um editor como o **VS Code**.
- Crie um arquivo {{meu_programa.py}} e rode no terminal com:
~~~bash
python meu_programa.py
~~~
Sem instalar nada? Dá pra testar online em sites como **Replit** ou **Programiz**.`,
    sugestoes: ["print em python", "variáveis em python"],
  },
  {
    id: "py-print",
    lang: "python",
    titulo: "print: mostrando coisas na tela",
    chaves: ["print", "mostrar na tela", "escrever na tela", "imprimir", "ola mundo", "hello world", "primeiro programa"],
    resposta: `### print() — mostrando na tela
O {{print()}} escreve qualquer coisa na tela. É o primeiro comando que todo mundo aprende:
~~~python
print("Olá, mundo!")
print("Meu nome é WC DEV")
print(10 + 5)        # mostra 15
print("Idade:", 15)  # vírgula separa os valores
~~~
- Texto vai entre **aspas** (simples ou duplas).
- Números não precisam de aspas.
- Tudo depois do {{#}} é **comentário**: o Python ignora.

**Desafio:** faça um programa que mostre seu nome e sua cidade.`,
    sugestoes: ["variáveis em python", "input em python"],
  },
  {
    id: "py-variaveis",
    lang: "python",
    titulo: "Variáveis",
    chaves: ["variavel", "variaveis", "guardar valor", "armazenar", "criar variavel"],
    resposta: `### Variáveis
Uma variável é uma **caixinha com nome** que guarda um valor:
~~~python
nome = "Cesar"
idade = 15
altura = 1.75

print(nome)
print(idade + 1)   # 16
~~~
Regras do nome:
- Não pode começar com número ({{1nome}} ❌).
- Sem espaços: use {{_}} ({{nome_completo}} ✅).
- Python diferencia maiúsculas: {{Nome}} e {{nome}} são diferentes.

Você pode trocar o valor depois: {{idade = 20}}.`,
    sugestoes: ["tipos de dados python", "input em python"],
  },
  {
    id: "py-tipos",
    lang: "python",
    titulo: "Tipos de dados",
    chaves: ["tipos de dados", "tipo de dado", "int", "float", "str", "string", "bool", "booleano", "type", "converter", "conversao"],
    resposta: `### Tipos de dados
~~~python
texto = "olá"        # str   (texto)
inteiro = 42         # int   (número inteiro)
decimal = 3.14       # float (número com vírgula, usa ponto!)
verdade = True       # bool  (True ou False)

print(type(inteiro)) # <class 'int'>
~~~
**Convertendo tipos:**
~~~python
numero = int("10")     # texto -> inteiro
texto = str(99)        # inteiro -> texto
preco = float("4.50")  # texto -> decimal
~~~
Isso é muito usado com o {{input()}}, que sempre devolve texto.`,
    sugestoes: ["input em python", "operadores python"],
  },
  {
    id: "py-input",
    lang: "python",
    titulo: "input: perguntando ao usuário",
    chaves: ["input", "perguntar", "ler do teclado", "digitar", "entrada do usuario", "pedir nome"],
    resposta: `### input() — conversando com o usuário
O {{input()}} espera o usuário digitar algo:
~~~python
nome = input("Qual é o seu nome? ")
print("Prazer,", nome)
~~~
⚠️ O {{input()}} **sempre devolve texto**. Pra fazer contas, converta:
~~~python
idade = int(input("Sua idade: "))
print("Ano que vem você terá", idade + 1)
~~~
**Desafio:** peça dois números e mostre a soma.`,
    sugestoes: ["operadores python", "if else python"],
  },
  {
    id: "py-operadores",
    lang: "python",
    titulo: "Operadores e contas",
    chaves: ["operador", "operadores", "conta", "contas", "soma", "somar", "subtrair", "multiplicar", "dividir", "divisao", "resto", "potencia", "matematica", "calculadora"],
    resposta: `### Operadores
~~~python
print(10 + 3)   # 13  soma
print(10 - 3)   # 7   subtração
print(10 * 3)   # 30  multiplicação
print(10 / 3)   # 3.33 divisão
print(10 // 3)  # 3   divisão inteira
print(10 % 3)   # 1   resto
print(2 ** 3)   # 8   potência
~~~
**Comparação** (dão True ou False):
~~~python
5 == 5   # igual
5 != 3   # diferente
5 > 3    # maior
5 <= 5   # menor ou igual
~~~
**Lógicos:** {{and}} (e), {{or}} (ou), {{not}} (não).
Dica: o {{%}} é ótimo pra saber se um número é par: {{n % 2 == 0}}.`,
    sugestoes: ["if else python", "for em python"],
  },
  {
    id: "py-if",
    lang: "python",
    titulo: "if, elif e else (decisões)",
    chaves: ["if", "else", "elif", "condicao", "condicional", "se senao", "decisao", "comparar"],
    resposta: `### if / elif / else
Serve pro programa **tomar decisões**:
~~~python
idade = int(input("Idade: "))

if idade >= 18:
    print("Maior de idade")
elif idade >= 13:
    print("Adolescente")
else:
    print("Criança")
~~~
⚠️ Repare:
- Depois da condição vem **dois pontos** {{:}}.
- O código de dentro tem **4 espaços** de recuo (indentação). Isso é obrigatório em Python!

Combinando condições:
~~~python
if nota >= 7 and faltas < 10:
    print("Aprovado")
~~~`,
    sugestoes: ["for em python", "while em python"],
  },
  {
    id: "py-for",
    lang: "python",
    titulo: "for (repetição)",
    chaves: ["for", "laco", "loop", "repetir", "repeticao", "range", "contar ate"],
    resposta: `### for — repetindo coisas
Repete um bloco para cada item:
~~~python
for i in range(5):
    print("Volta", i)   # 0, 1, 2, 3, 4
~~~
{{range(inicio, fim, passo)}}:
~~~python
for n in range(1, 11):       # 1 até 10
    print(n)

for n in range(10, 0, -1):   # contagem regressiva
    print(n)
~~~
Percorrendo uma lista:
~~~python
frutas = ["maçã", "banana", "uva"]
for fruta in frutas:
    print("Eu gosto de", fruta)
~~~
**Desafio:** mostre a tabuada do 7.`,
    sugestoes: ["while em python", "listas em python"],
  },
  {
    id: "py-while",
    lang: "python",
    titulo: "while (repetir enquanto)",
    chaves: ["while", "enquanto", "loop infinito", "break", "continue", "repetir ate"],
    resposta: `### while — repete enquanto for verdade
~~~python
contador = 1
while contador <= 5:
    print(contador)
    contador += 1   # mesma coisa que contador = contador + 1
~~~
Muito usado em menus e jogos:
~~~python
while True:
    resposta = input("Digite 'sair' para parar: ")
    if resposta == "sair":
        break        # sai do loop
    print("Você digitou:", resposta)
~~~
- {{break}} para o loop.
- {{continue}} pula pra próxima volta.
⚠️ Cuidado com loop infinito: sempre tenha um jeito de parar!`,
    sugestoes: ["listas em python", "funções em python"],
  },
  {
    id: "py-listas",
    lang: "python",
    titulo: "Listas",
    chaves: ["lista", "listas", "array", "vetor", "append", "remove", "adicionar na lista", "len", "indice"],
    resposta: `### Listas
Guardam **vários valores** em uma variável:
~~~python
jogos = ["Minecraft", "Roblox", "Fortnite"]

print(jogos[0])       # Minecraft (começa no 0!)
print(jogos[-1])      # Fortnite (último)
print(len(jogos))     # 3 (tamanho)

jogos.append("FIFA")      # adiciona no fim
jogos.remove("Fortnite")  # remove pelo valor
jogos[0] = "Terraria"     # troca um item
jogos.sort()              # ordena
~~~
Verificar se tem um item:
~~~python
if "Roblox" in jogos:
    print("Tem Roblox!")
~~~`,
    sugestoes: ["dicionários em python", "for em python"],
  },
  {
    id: "py-dicionarios",
    lang: "python",
    titulo: "Dicionários",
    chaves: ["dicionario", "dicionarios", "dict", "chave e valor", "chave valor", "json"],
    resposta: `### Dicionários
Guardam dados em pares **chave: valor**:
~~~python
jogador = {
    "nome": "Cesar",
    "nivel": 12,
    "vida": 100
}

print(jogador["nome"])     # Cesar
jogador["vida"] -= 20      # muda um valor
jogador["moedas"] = 50     # cria uma chave nova

for chave, valor in jogador.items():
    print(chave, "=", valor)
~~~
Use {{jogador.get("xp", 0)}} pra pegar um valor sem dar erro se a chave não existir.`,
    sugestoes: ["funções em python", "strings em python"],
  },
  {
    id: "py-strings",
    lang: "python",
    titulo: "Strings e f-strings",
    chaves: ["f string", "fstring", "f-string", "formatar texto", "manipular texto", "upper", "lower", "split", "replace", "juntar texto", "concatenar"],
    resposta: `### Trabalhando com texto
A forma mais fácil de juntar texto e variáveis é a **f-string** (coloque um {{f}} antes das aspas):
~~~python
nome = "Ana"
pontos = 90
print(f"{nome} fez {pontos} pontos!")
~~~
Funções úteis:
~~~python
frase = "Aprendendo Python"
print(frase.upper())          # APRENDENDO PYTHON
print(frase.lower())          # aprendendo python
print(frase.replace("Python", "HTML"))
print(frase.split(" "))       # ['Aprendendo', 'Python']
print(len(frase))             # 17
print(frase[0:5])             # Apren
~~~`,
    sugestoes: ["funções em python", "listas em python"],
  },
  {
    id: "py-funcoes",
    lang: "python",
    titulo: "Funções",
    chaves: ["funcao", "funcoes", "def", "return", "retornar", "parametro", "parametros", "criar funcao"],
    resposta: `### Funções
Uma função é um **bloco de código com nome** que você pode usar várias vezes:
~~~python
def saudar(nome):
    print(f"Olá, {nome}!")

saudar("Cesar")
saudar("Maria")
~~~
Com {{return}} ela devolve um resultado:
~~~python
def somar(a, b):
    return a + b

resultado = somar(3, 4)
print(resultado)   # 7
~~~
Valor padrão:
~~~python
def potencia(base, exp=2):
    return base ** exp

print(potencia(5))     # 25
print(potencia(2, 3))  # 8
~~~`,
    sugestoes: ["erros em python", "classes em python"],
  },
  {
    id: "py-erros",
    lang: "python",
    titulo: "Erros e try/except",
    chaves: ["try", "except", "erros em python", "tratar erro", "excecao", "valueerror", "syntaxerror", "indentationerror", "nameerror", "typeerror", "traceback"],
    resposta: `### Tratando erros
Use {{try}} / {{except}} pro programa não quebrar:
~~~python
try:
    numero = int(input("Digite um número: "))
    print(10 / numero)
except ValueError:
    print("Isso não é um número!")
except ZeroDivisionError:
    print("Não dá pra dividir por zero!")
~~~
Erros comuns:
- **SyntaxError**: escreveu algo errado (faltou {{:}}, aspas, parênteses).
- **IndentationError**: os espaços no começo da linha estão errados.
- **NameError**: usou uma variável que não existe (ou escreveu o nome errado).
- **TypeError**: misturou tipos, tipo somar texto com número.`,
    sugestoes: ["classes em python", "módulos em python"],
  },
  {
    id: "py-modulos",
    lang: "python",
    titulo: "Módulos e import",
    chaves: ["import", "modulo", "modulos", "biblioteca", "random", "aleatorio", "numero aleatorio", "pip", "math", "time"],
    resposta: `### Módulos (import)
Módulos são códigos prontos que você pode usar:
~~~python
import random
import math
import time

print(random.randint(1, 6))           # dado de 1 a 6
print(random.choice(["pedra", "papel", "tesoura"]))
print(math.sqrt(16))                  # 4.0
time.sleep(2)                         # espera 2 segundos
~~~
Bibliotecas de fora se instalam com o **pip** no terminal:
~~~bash
pip install pygame
~~~
**Desafio:** faça um jogo de adivinhar um número de 1 a 10 usando {{random}} e {{while}}.`,
    sugestoes: ["classes em python", "arquivos em python"],
  },
  {
    id: "py-classes",
    lang: "python",
    titulo: "Classes e objetos",
    chaves: ["classe", "classes", "class", "objeto", "objetos", "poo", "orientacao a objetos", "self", "init"],
    resposta: `### Classes (Programação Orientada a Objetos)
Uma classe é um **molde** para criar objetos:
~~~python
class Personagem:
    def __init__(self, nome, vida):
        self.nome = nome
        self.vida = vida

    def tomar_dano(self, dano):
        self.vida -= dano
        print(f"{self.nome} agora tem {self.vida} de vida")

heroi = Personagem("Guerreiro", 100)
heroi.tomar_dano(30)   # Guerreiro agora tem 70 de vida
~~~
- {{__init__}} roda quando o objeto é criado.
- {{self}} é o próprio objeto.`,
    sugestoes: ["arquivos em python", "projeto em python"],
  },
  {
    id: "py-arquivos",
    lang: "python",
    titulo: "Lendo e salvando arquivos",
    chaves: ["arquivo", "arquivos", "open", "ler arquivo", "salvar arquivo", "escrever arquivo", "txt", "salvar dados"],
    resposta: `### Arquivos
Salvando:
~~~python
with open("notas.txt", "w", encoding="utf-8") as arq:
    arq.write("Minha primeira nota\\n")
~~~
Lendo:
~~~python
with open("notas.txt", "r", encoding="utf-8") as arq:
    for linha in arq:
        print(linha.strip())
~~~
Modos: {{"w"}} escreve (apaga o que tinha), {{"a"}} adiciona no fim, {{"r"}} lê.`,
    sugestoes: ["projeto em python"],
  },
  {
    id: "py-projeto",
    lang: "python",
    titulo: "Projeto: jogo de adivinhação",
    chaves: ["projeto", "projeto em python", "exercicio", "exercicios", "desafio", "praticar", "jogo em python", "adivinhacao"],
    resposta: `### Projeto final: jogo de adivinhação 🎲
Junta tudo que você aprendeu:
~~~python
import random

def jogar():
    segredo = random.randint(1, 50)
    tentativas = 0

    while True:
        try:
            palpite = int(input("Chute um número de 1 a 50: "))
        except ValueError:
            print("Digite só números!")
            continue

        tentativas += 1
        if palpite < segredo:
            print("Mais alto ⬆️")
        elif palpite > segredo:
            print("Mais baixo ⬇️")
        else:
            print(f"Acertou em {tentativas} tentativas! 🎉")
            break

jogar()
~~~
**Melhore:** limite de 7 tentativas, níveis de dificuldade, ou salve o recorde num arquivo.`,
    sugestoes: ["/html", "/css"],
  }
);
