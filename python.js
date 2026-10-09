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

/* =========================================================
   PYTHON — CONSULTA (cada item: nome, explicação, exemplo, palavras extras)
   ========================================================= */
WCDEV.refs = WCDEV.refs || [];

WCDEV.refs.push({ lang: "python", grupo: "Função embutida", itens: [
  ["len", "Devolve o **tamanho** de um texto, lista, tupla ou dicionário.", `print(len("Python"))     # 6
print(len([1, 2, 3]))     # 3`, "tamanho|quantos itens|comprimento"],
  ["range", "Gera uma sequência de números. Muito usado com {{for}}: {{range(fim)}}, {{range(inicio, fim)}}, {{range(inicio, fim, passo)}}. O fim **não entra**.", `for i in range(2, 10, 2):
    print(i)   # 2 4 6 8`, "sequencia de numeros"],
  ["abs", "Devolve o valor **absoluto** (sem sinal) de um número.", `print(abs(-7))    # 7
print(abs(3.5))   # 3.5`, "valor absoluto|modulo de numero|tirar sinal negativo"],
  ["round", "**Arredonda** um número. O segundo valor diz quantas casas decimais.", `print(round(3.14159, 2))  # 3.14
print(round(2.7))         # 3`, "arredondar|casas decimais"],
  ["max", "Devolve o **maior** valor de uma lista ou de vários valores.", `print(max(4, 9, 2))         # 9
print(max([10, 50, 30]))     # 50
print(max(["ana", "zeca"], key=len))`, "maior valor|maior numero"],
  ["min", "Devolve o **menor** valor.", `print(min(4, 9, 2))      # 2
print(min([10, 50, 30]))  # 10`, "menor valor|menor numero"],
  ["sum", "**Soma** todos os números de uma lista.", `notas = [7, 8.5, 9]
print(sum(notas))              # 24.5
print(sum(notas) / len(notas)) # média`, "somar lista|soma total|media"],
  ["sorted", "Devolve uma **nova lista ordenada** (não muda a original). Use {{reverse=True}} pra ordem decrescente e {{key=}} pra escolher o critério.", `nums = [5, 2, 8]
print(sorted(nums))                 # [2, 5, 8]
print(sorted(nums, reverse=True))   # [8, 5, 2]
print(sorted(["bb", "a", "ccc"], key=len))`, "ordenar|ordem crescente|ordem decrescente|ordem alfabetica"],
  ["reversed", "Percorre algo de **trás pra frente**.", `for letra in reversed("abc"):
    print(letra)   # c b a
print(list(reversed([1, 2, 3])))`, "inverter|ao contrario|de tras pra frente"],
  ["enumerate", "Percorre uma lista recebendo o **índice e o item** ao mesmo tempo.", `frutas = ["maçã", "uva"]
for i, fruta in enumerate(frutas, start=1):
    print(i, fruta)   # 1 maçã / 2 uva`, "indice e valor|numerar itens"],
  ["zip", "Junta duas ou mais listas, **item por item**.", `nomes = ["Ana", "Bia"]
notas = [9, 7]
for nome, nota in zip(nomes, notas):
    print(nome, nota)
print(dict(zip(nomes, notas)))`, "juntar listas|duas listas juntas"],
  ["map", "Aplica uma função em **cada item** de uma lista.", `textos = ["1", "2", "3"]
numeros = list(map(int, textos))   # [1, 2, 3]
dobro = list(map(lambda x: x * 2, numeros))`, "aplicar funcao em todos"],
  ["filter", "Mantém só os itens que passam num **teste**.", `nums = [1, 2, 3, 4, 5, 6]
pares = list(filter(lambda n: n % 2 == 0, nums))
print(pares)   # [2, 4, 6]`, "filtrar lista|filtrar"],
  ["any", "Devolve {{True}} se **pelo menos um** item for verdadeiro.", `idades = [12, 15, 19]
print(any(i >= 18 for i in idades))   # True`, "algum verdadeiro|pelo menos um"],
  ["all", "Devolve {{True}} se **todos** os itens forem verdadeiros.", `notas = [7, 8, 9]
print(all(n >= 7 for n in notas))   # True`, "todos verdadeiros|todos passam"],
  ["int", "Converte para **número inteiro**. Também converte de outras bases.", `print(int("42"))      # 42
print(int(3.9))       # 3 (corta, não arredonda)
print(int("ff", 16))  # 255`, "converter para inteiro|numero inteiro"],
  ["float", "Converte para **número decimal**.", `print(float("3.5"))   # 3.5
print(float(10))      # 10.0`, "converter para decimal|numero decimal|numero com virgula"],
  ["str", "Converte qualquer coisa em **texto**.", `idade = 15
print("Tenho " + str(idade) + " anos")`, "converter para texto|converter para string"],
  ["bool", "Converte para {{True}} ou {{False}}. Zero, texto vazio, lista vazia e {{None}} viram {{False}}.", `print(bool(0))     # False
print(bool("oi"))  # True
print(bool([]))    # False`, "verdadeiro ou falso|truthy|falsy"],
  ["list", "Cria uma **lista** (ou converte algo em lista).", `print(list("abc"))        # ['a', 'b', 'c']
print(list(range(4)))     # [0, 1, 2, 3]`, "criar lista|converter em lista"],
  ["tuple", "Cria uma **tupla**: parecida com lista, mas **não pode ser alterada**.", `ponto = (10, 20)
x, y = ponto
print(tuple([1, 2]))`, "tupla|tuplas|lista imutavel"],
  ["dict", "Cria um **dicionário**.", `pessoa = dict(nome="Ana", idade=15)
print(pessoa)   # {'nome': 'Ana', 'idade': 15}`, "criar dicionario"],
  ["set", "Cria um **conjunto**: guarda valores **sem repetir** e sem ordem.", `nums = [1, 2, 2, 3, 3]
print(set(nums))         # {1, 2, 3}
print(list(set(nums)))   # tira repetidos`, "conjunto|tirar repetidos|remover duplicados|sem repeticao"],
  ["frozenset", "Um {{set}} que **não pode ser alterado**.", `cores = frozenset(["azul", "preto"])`, "conjunto imutavel"],
  ["type", "Mostra o **tipo** de um valor.", `print(type(10))      # <class 'int'>
print(type("oi"))    # <class 'str'>`, "qual o tipo|ver tipo"],
  ["isinstance", "Testa se um valor é de certo tipo.", `x = 5
if isinstance(x, int):
    print("É inteiro")`, "verificar tipo|checar tipo"],
  ["input", "Lê o que o usuário digitar. Sempre devolve **texto**.", `nome = input("Nome: ")
idade = int(input("Idade: "))`, "ler teclado"],
  ["print", "Mostra na tela. Aceita {{sep=}} (separador) e {{end=}} (o que vai no final).", `print("a", "b", sep="-")    # a-b
print("sem pular linha", end="")`, "sep|end"],
  ["open", "Abre um arquivo. Modos: {{\"r\"}} ler, {{\"w\"}} escrever, {{\"a\"}} adicionar, {{\"rb\"}} binário.", `with open("dados.txt", "r", encoding="utf-8") as f:
    texto = f.read()`, "abrir arquivo"],
  ["chr", "Converte um **número em caractere** (tabela Unicode).", `print(chr(65))    # A
print(chr(9829))  # ♥`, "numero para letra|codigo para caractere"],
  ["ord", "Converte um **caractere em número** (o contrário de {{chr}}).", `print(ord("A"))   # 65
print(ord("a"))   # 97`, "letra para numero|codigo ascii|unicode"],
  ["bin", "Mostra um número em **binário**.", `print(bin(10))   # 0b1010`, "binario|base 2"],
  ["hex", "Mostra um número em **hexadecimal**.", `print(hex(255))  # 0xff`, "hexadecimal|base 16"],
  ["oct", "Mostra um número em **octal**.", `print(oct(8))    # 0o10`, "octal|base 8"],
  ["pow", "Potência. Com 3 valores calcula o resto da potência.", `print(pow(2, 10))     # 1024
print(pow(2, 10, 7))  # 1024 % 7`, "potencia|elevado"],
  ["divmod", "Devolve a **divisão inteira e o resto** de uma vez.", `q, r = divmod(17, 5)
print(q, r)   # 3 2`, "quociente e resto"],
  ["help", "Mostra a **ajuda** de uma função ou módulo direto no terminal.", `help(len)
help(str.split)`, "documentacao|ajuda python"],
  ["dir", "Lista tudo que um objeto tem (métodos e atributos).", `print(dir(str))   # todos os métodos de texto`, "listar metodos"],
  ["id", "Mostra o **endereço** de um objeto na memória.", `a = [1]
b = a
print(id(a) == id(b))   # True: é a mesma lista`, "endereco memoria"],
  ["hash", "Gera um número que representa o valor (usado por dicionários e sets).", `print(hash("python"))`, ""],
  ["callable", "Diz se algo pode ser **chamado** como função.", `print(callable(print))  # True
print(callable(5))      # False`, ""],
  ["getattr", "Pega um atributo pelo **nome em texto**.", `class Gato:
    som = "miau"
print(getattr(Gato, "som"))          # miau
print(getattr(Gato, "cor", "sem cor"))`, "pegar atributo"],
  ["setattr", "Muda um atributo pelo nome em texto.", `setattr(jogador, "vida", 100)`, "mudar atributo"],
  ["hasattr", "Diz se um objeto **tem** certo atributo.", `print(hasattr("texto", "upper"))  # True`, "tem atributo"],
  ["delattr", "Apaga um atributo de um objeto.", `delattr(jogador, "escudo")`, ""],
  ["vars", "Mostra os atributos de um objeto como dicionário.", `print(vars(jogador))`, ""],
  ["eval", "Executa um texto como expressão Python. ⚠️ **Perigoso** com texto digitado pelo usuário: ele pode rodar qualquer coisa.", `print(eval("2 + 3"))   # 5`, "calcular expressao texto"],
  ["exec", "Executa um texto como código Python. ⚠️ Evite com dados do usuário.", `exec("x = 10\\nprint(x)")`, ""],
  ["repr", "Mostra a forma \"técnica\" de um valor (útil pra depurar).", `print(repr("oi\\n"))   # 'oi\\n'`, ""],
  ["format", "Formata um valor (casas decimais, alinhamento...).", `print(format(3.14159, ".2f"))   # 3.14
print(format(1234567, ","))     # 1,234,567`, "formatar numero"],
  ["iter", "Cria um **iterador** a partir de uma lista.", `it = iter([1, 2, 3])
print(next(it))   # 1`, "iterador"],
  ["next", "Pega o **próximo** item de um iterador ou gerador.", `it = iter("ab")
print(next(it))  # a
print(next(it))  # b`, "proximo item"],
  ["slice", "Cria um corte reutilizável (igual a {{[inicio:fim:passo]}}).", `corte = slice(1, 4)
print("Python"[corte])   # yth`, ""],
  ["super", "Chama o método da **classe mãe** (herança).", `class Animal:
    def __init__(self, nome):
        self.nome = nome

class Cao(Animal):
    def __init__(self, nome):
        super().__init__(nome)
        self.som = "au"`, "classe mae|classe pai"],
  ["object", "A classe base de **tudo** em Python.", `class Coisa(object):
    pass`, ""],
  ["globals", "Mostra as variáveis globais como dicionário.", `print(globals().keys())`, ""],
  ["locals", "Mostra as variáveis locais (dentro da função).", `def f():
    a = 1
    print(locals())   # {'a': 1}`, ""],
  ["complex", "Cria um **número complexo**.", `z = complex(2, 3)
print(z)        # (2+3j)
print(z.real)   # 2.0`, "numero complexo"],
  ["bytes", "Cria uma sequência de **bytes** (dados binários).", `b = "olá".encode("utf-8")
print(b)
print(b.decode("utf-8"))`, "binario texto"],
  ["breakpoint", "**Pausa** o programa e abre o depurador ali.", `x = 10
breakpoint()   # digite n (próximo), c (continuar), p x (ver variável)`, "depurador|pausar programa"],
  ["staticmethod", "Método da classe que **não usa** {{self}}.", `class Mat:
    @staticmethod
    def dobro(n):
        return n * 2
print(Mat.dobro(4))`, "metodo estatico"],
  ["classmethod", "Método que recebe a **classe** ({{cls}}) em vez do objeto.", `class Pessoa:
    total = 0
    @classmethod
    def contar(cls):
        return cls.total`, "metodo de classe"],
  ["property", "Transforma um método em algo que se usa como **atributo**.", `class Circulo:
    def __init__(self, r):
        self.r = r
    @property
    def area(self):
        return 3.14 * self.r ** 2

print(Circulo(2).area)`, "getter|setter"],
]});

WCDEV.refs.push({ lang: "python", grupo: "Método de texto (str)", itens: [
  ["upper", "Deixa o texto em **MAIÚSCULAS**.", `print("olá".upper())   # OLÁ`, "maiusculo|maiuscula|caixa alta"],
  ["lower", "Deixa o texto em **minúsculas**.", `print("OLÁ".lower())   # olá`, "minusculo|minuscula|caixa baixa"],
  ["capitalize", "Primeira letra maiúscula, o resto minúsculo.", `print("pYTHON".capitalize())   # Python`, "primeira letra maiuscula"],
  ["title", "Primeira letra de **cada palavra** maiúscula.", `print("joão da silva".title())   # João Da Silva`, "cada palavra maiuscula"],
  ["swapcase", "Inverte maiúsculas e minúsculas.", `print("PyThOn".swapcase())   # pYtHoN`, "inverter maiusculas"],
  ["casefold", "Igual ao {{lower}}, mas mais forte (bom pra comparar textos).", `print("Straße".casefold() == "strasse")   # True`, ""],
  ["strip", "Tira **espaços** (ou outros caracteres) do começo e do fim.", `print("  oi  ".strip())     # "oi"
print("--oi--".strip("-"))  # "oi"`, "tirar espacos|remover espacos|trim"],
  ["lstrip", "Tira espaços só da **esquerda**.", `print("   oi".lstrip())`, ""],
  ["rstrip", "Tira espaços só da **direita** (bom pra tirar o {{\\n}} de linhas).", `print("oi\\n".rstrip())`, ""],
  ["split", "**Quebra** o texto em uma lista, usando um separador.", `print("a,b,c".split(","))        # ['a', 'b', 'c']
print("bom dia gente".split())   # separa por espaço`, "separar texto|quebrar texto|dividir texto"],
  ["rsplit", "Igual ao {{split}}, mas começa pela direita.", `print("a.b.c".rsplit(".", 1))   # ['a.b', 'c']`, ""],
  ["splitlines", "Separa o texto em **linhas**.", `texto = "linha 1\\nlinha 2"
print(texto.splitlines())`, "separar linhas"],
  ["join", "**Junta** uma lista de textos usando um separador.", `palavras = ["eu", "amo", "python"]
print(" ".join(palavras))    # eu amo python
print("-".join(palavras))    # eu-amo-python`, "juntar lista|juntar textos|lista para texto"],
  ["replace", "**Troca** um pedaço do texto por outro.", `frase = "eu gosto de java"
print(frase.replace("java", "python"))`, "trocar texto|substituir"],
  ["find", "Procura um texto e devolve a **posição**. Se não achar, devolve {{-1}}.", `print("banana".find("na"))   # 2
print("banana".find("x"))    # -1`, "procurar texto|posicao no texto"],
  ["rfind", "Igual ao {{find}}, mas procura de trás pra frente.", `print("banana".rfind("na"))   # 4`, ""],
  ["str.index", "Igual ao {{find}}, mas dá **erro** se não achar.", `print("banana".index("n"))   # 2`, "index texto|index string"],
  ["str.count", "**Conta** quantas vezes um texto aparece.", `print("banana".count("a"))   # 3`, "contar letras|contar palavra|count texto"],
  ["startswith", "Testa se o texto **começa** com algo.", `print("python.py".startswith("py"))   # True`, "comeca com"],
  ["endswith", "Testa se o texto **termina** com algo.", `arquivo = "foto.png"
if arquivo.endswith((".png", ".jpg")):
    print("É imagem")`, "termina com|extensao"],
  ["isdigit", "Testa se o texto tem **só números**. Ótimo pra validar {{input}}.", `idade = input("Idade: ")
if idade.isdigit():
    idade = int(idade)`, "so numeros|validar numero|e numero"],
  ["isnumeric", "Parecido com {{isdigit}}, aceita mais tipos de números (como ½).", `print("123".isnumeric())   # True`, ""],
  ["isalpha", "Testa se tem **só letras**.", `print("Ana".isalpha())    # True
print("Ana1".isalpha())   # False`, "so letras"],
  ["isalnum", "Testa se tem só **letras e números**.", `print("user123".isalnum())   # True`, "letras e numeros"],
  ["isspace", "Testa se tem **só espaços**.", `print("   ".isspace())   # True`, ""],
  ["isupper", "Testa se está tudo em maiúsculas.", `print("OI".isupper())   # True`, ""],
  ["islower", "Testa se está tudo em minúsculas.", `print("oi".islower())   # True`, ""],
  ["istitle", "Testa se cada palavra começa com maiúscula.", `print("Olá Mundo".istitle())   # True`, ""],
  ["center", "**Centraliza** o texto num espaço, preenchendo dos lados.", `print("MENU".center(20, "="))   # ========MENU========`, "centralizar texto terminal"],
  ["ljust", "Alinha à **esquerda**, completando até um tamanho.", `print("Nome".ljust(10) + "|")`, "alinhar esquerda"],
  ["rjust", "Alinha à **direita**.", `print("42".rjust(6))   # "    42"`, "alinhar direita"],
  ["zfill", "Completa com **zeros** à esquerda.", `print("7".zfill(3))   # 007`, "zeros a esquerda"],
  ["partition", "Divide o texto em 3 partes: antes, separador, depois.", `print("nome=Ana".partition("="))   # ('nome', '=', 'Ana')`, ""],
  ["str.format", "Jeito antigo de colocar valores no texto (hoje se usa mais f-string).", `print("{} tem {} anos".format("Ana", 15))
print("{:.2f}".format(3.14159))`, "format texto"],
  ["removeprefix", "Tira um começo do texto (se existir).", `print("img_foto.png".removeprefix("img_"))   # foto.png`, ""],
  ["removesuffix", "Tira um final do texto (se existir).", `print("foto.png".removesuffix(".png"))   # foto`, "tirar extensao"],
  ["encode", "Transforma texto em **bytes**.", `dados = "olá".encode("utf-8")`, ""],
  ["decode", "Transforma **bytes** em texto.", `print(b"ol\\xc3\\xa1".decode("utf-8"))   # olá`, ""],
  ["expandtabs", "Troca os TABs por espaços.", `print("a\\tb".expandtabs(4))`, ""],
  ["maketrans", "Cria uma tabela de troca de letras (usada com {{translate}}).", `tabela = str.maketrans("aeiou", "43105")
print("python e legal".translate(tabela))`, "translate|trocar letras"],
]});

WCDEV.refs.push({ lang: "python", grupo: "Método de lista", itens: [
  ["append", "Adiciona **um item no final** da lista.", `lista = [1, 2]
lista.append(3)   # [1, 2, 3]`, "adicionar no final|colocar na lista"],
  ["extend", "Adiciona **vários itens** de uma vez.", `lista = [1, 2]
lista.extend([3, 4])   # [1, 2, 3, 4]`, "adicionar varios|juntar listas"],
  ["insert", "Coloca um item numa **posição** específica.", `lista = ["a", "c"]
lista.insert(1, "b")   # ['a', 'b', 'c']`, "inserir na posicao"],
  ["remove", "Remove o **primeiro** item com aquele valor. Dá erro se não existir.", `lista = ["a", "b", "a"]
lista.remove("a")   # ['b', 'a']`, "remover item|tirar da lista"],
  ["pop", "Remove e **devolve** um item pela posição (o último, se não disser qual).", `lista = [10, 20, 30]
ultimo = lista.pop()     # 30
primeiro = lista.pop(0)  # 10`, "tirar ultimo|remover por posicao"],
  ["clear", "Esvazia a lista (ou dicionário, ou set).", `lista = [1, 2, 3]
lista.clear()   # []`, "esvaziar|limpar lista"],
  ["list.index", "Mostra a **posição** de um item na lista.", `print(["a", "b", "c"].index("b"))   # 1`, "index lista|posicao na lista"],
  ["list.count", "Conta quantas vezes um item aparece na lista.", `print([1, 2, 2, 2].count(2))   # 3`, "count lista|contar na lista"],
  ["sort", "**Ordena** a própria lista (muda ela).", `nums = [3, 1, 2]
nums.sort()                 # [1, 2, 3]
nums.sort(reverse=True)     # [3, 2, 1]`, "ordenar lista"],
  ["reverse", "**Inverte** a ordem da própria lista.", `nums = [1, 2, 3]
nums.reverse()   # [3, 2, 1]`, "inverter lista"],
  ["copy", "Faz uma **cópia** da lista (ou dicionário). Sem isso, {{b = a}} aponta pra mesma lista!", `a = [1, 2]
b = a.copy()
b.append(3)
print(a)   # [1, 2] (não mudou)`, "copiar lista|copia de lista"],
]});

WCDEV.refs.push({ lang: "python", grupo: "Método de dicionário", itens: [
  ["keys", "Devolve todas as **chaves** do dicionário.", `d = {"nome": "Ana", "idade": 15}
print(list(d.keys()))   # ['nome', 'idade']`, "chaves do dicionario"],
  ["values", "Devolve todos os **valores**.", `print(list(d.values()))   # ['Ana', 15]`, "valores do dicionario"],
  ["items", "Devolve os pares **(chave, valor)**. Perfeito pra {{for}}.", `for chave, valor in d.items():
    print(chave, "->", valor)`, "percorrer dicionario"],
  ["get", "Pega um valor **sem dar erro** se a chave não existir.", `d = {"nome": "Ana"}
print(d.get("idade"))       # None
print(d.get("idade", 0))    # 0`, "pegar valor dicionario"],
  ["update", "Junta outro dicionário (ou atualiza valores).", `d = {"a": 1}
d.update({"b": 2, "a": 10})   # {'a': 10, 'b': 2}`, "juntar dicionarios|atualizar dicionario"],
  ["dict.pop", "Remove uma chave e devolve o valor.", `vida = d.pop("vida", None)`, "remover chave"],
  ["popitem", "Remove e devolve o **último** par adicionado.", `d = {"a": 1, "b": 2}
print(d.popitem())   # ('b', 2)`, ""],
  ["setdefault", "Pega o valor; se a chave não existir, **cria** com um valor padrão.", `estoque = {}
estoque.setdefault("maçã", 0)
estoque["maçã"] += 5`, "valor padrao"],
  ["fromkeys", "Cria um dicionário com várias chaves e o mesmo valor.", `notas = dict.fromkeys(["Ana", "Bia"], 0)
print(notas)   # {'Ana': 0, 'Bia': 0}`, ""],
  ["del", "Apaga uma variável, um item de lista ou uma chave de dicionário.", `d = {"a": 1, "b": 2}
del d["a"]
lista = [1, 2, 3]
del lista[0]`, "apagar|deletar"],
]});

WCDEV.refs.push({ lang: "python", grupo: "Método de conjunto (set)", itens: [
  ["add", "Adiciona um item ao set.", `s = {1, 2}
s.add(3)`, "adicionar no set"],
  ["discard", "Remove um item do set **sem dar erro** se não existir.", `s = {1, 2}
s.discard(5)   # nada acontece`, ""],
  ["union", "**União**: junta dois sets (também dá pra usar {{|}}).", `a = {1, 2}
b = {2, 3}
print(a | b)   # {1, 2, 3}`, "uniao|juntar sets"],
  ["intersection", "**Interseção**: o que tem nos dois (ou {{&}}).", `print({1, 2} & {2, 3})   # {2}`, "intersecao|em comum"],
  ["difference", "**Diferença**: o que tem no primeiro e não no segundo (ou {{-}}).", `print({1, 2, 3} - {2})   # {1, 3}`, "diferenca de conjuntos"],
  ["symmetric_difference", "O que está em um **ou** outro, mas não nos dois (ou {{^}}).", `print({1, 2} ^ {2, 3})   # {1, 3}`, ""],
  ["issubset", "Testa se todos os itens estão dentro do outro set.", `print({1, 2}.issubset({1, 2, 3}))   # True`, "subconjunto"],
  ["issuperset", "Testa se contém todos os itens do outro set.", `print({1, 2, 3}.issuperset({1}))   # True`, ""],
  ["isdisjoint", "Testa se os sets **não têm nada** em comum.", `print({1, 2}.isdisjoint({3}))   # True`, ""],
]});

WCDEV.refs.push({ lang: "python", grupo: "Palavra reservada", itens: [
  ["and", "**E** lógico: só é verdade se os dois lados forem verdade.", `if idade >= 13 and idade <= 17:
    print("Adolescente")`, "e logico"],
  ["or", "**OU** lógico: é verdade se pelo menos um lado for verdade.", `if dia == "sábado" or dia == "domingo":
    print("Fim de semana!")`, "ou logico"],
  ["not", "**NÃO** lógico: inverte verdadeiro/falso.", `logado = False
if not logado:
    print("Faça login")`, "negacao|inverter condicao"],
  ["in", "Testa se algo **está dentro** de uma lista, texto ou dicionário.", `if "a" in "banana":
    print("Tem a!")
if 3 in [1, 2, 3]:
    print("Tem 3")`, "esta dentro|contem|verificar se existe"],
  ["is", "Testa se é **o mesmo objeto** (use pra {{None}}: {{if x is None}}).", `x = None
if x is None:
    print("Sem valor")`, "is none"],
  ["None", "Representa **\"nada\"**, sem valor. Funções sem {{return}} devolvem {{None}}.", `resultado = None
if resultado is None:
    print("Ainda não calculado")`, "nada|nulo|null|vazio"],
  ["True e False", "Os dois valores **booleanos**: verdadeiro e falso. Sempre com a primeira letra maiúscula!", `ligado = True
ligado = not ligado   # False`, "true|false|booleano python"],
  ["return", "Faz a função **devolver** um valor e terminar.", `def quadrado(n):
    return n * n
x = quadrado(4)   # 16`, "retornar valor|devolver valor"],
  ["break", "**Para** o loop na hora.", `for n in range(100):
    if n == 5:
        break
    print(n)   # 0 a 4`, "parar loop|sair do loop"],
  ["continue", "**Pula** para a próxima volta do loop.", `for n in range(6):
    if n % 2 == 0:
        continue
    print(n)   # 1 3 5`, "pular volta"],
  ["pass", "**Não faz nada**. Serve pra deixar um bloco vazio sem dar erro.", `def funcao_futura():
    pass

class Vazia:
    pass`, "bloco vazio|nao fazer nada"],
  ["global", "Permite mudar uma variável **global** dentro de uma função.", `pontos = 0
def ganhar():
    global pontos
    pontos += 10`, "variavel global"],
  ["nonlocal", "Muda uma variável da função **de fora** (função dentro de função).", `def contador():
    n = 0
    def mais():
        nonlocal n
        n += 1
        return n
    return mais`, ""],
  ["lambda", "Cria uma **função pequena** em uma linha, sem nome.", `dobro = lambda x: x * 2
print(dobro(5))   # 10
nomes = sorted(["bia", "Ana"], key=lambda s: s.lower())`, "funcao anonima|funcao de uma linha"],
  ["raise", "**Lança** um erro de propósito.", `def sacar(valor, saldo):
    if valor > saldo:
        raise ValueError("Saldo insuficiente")`, "lancar erro|gerar erro|criar erro"],
  ["finally", "Bloco do {{try}} que roda **sempre**, dando erro ou não.", `try:
    f = open("dados.txt")
except FileNotFoundError:
    print("Não achei")
finally:
    print("Fim da tentativa")`, ""],
  ["assert", "Confere se algo é verdade; se não for, dá {{AssertionError}}. Bom pra testes.", `def media(notas):
    assert len(notas) > 0, "Lista vazia!"
    return sum(notas) / len(notas)`, "afirmar|testar condicao"],
  ["with", "Abre algo e **fecha sozinho** no final (arquivos, conexões).", `with open("a.txt", "w") as f:
    f.write("oi")
# aqui o arquivo já foi fechado`, "gerenciador de contexto|context manager"],
  ["as", "Dá um **apelido** (em {{import}}, {{with}} e {{except}}).", `import random as rd
try:
    x = 1 / 0
except ZeroDivisionError as erro:
    print("Erro:", erro)`, "apelido|import as|except as"],
  ["from", "Importa **só uma parte** de um módulo.", `from math import sqrt, pi
print(sqrt(25))`, "from import"],
  ["yield", "Transforma a função num **gerador**: ela devolve valores um de cada vez.", `def contar_ate(n):
    i = 1
    while i <= n:
        yield i
        i += 1

for x in contar_ate(3):
    print(x)`, "gerador|generator"],
  ["async e await", "Código **assíncrono**: faz várias tarefas esperarem ao mesmo tempo sem travar.", `import asyncio

async def tarefa(nome):
    await asyncio.sleep(1)
    print(nome, "pronto")

async def main():
    await asyncio.gather(tarefa("A"), tarefa("B"))

asyncio.run(main())`, "async|await|assincrono"],
  ["match case", "Escolhe entre vários casos (tipo o {{switch}} de outras linguagens). Python 3.10+.", `comando = "pular"
match comando:
    case "andar":
        print("Andando")
    case "pular":
        print("Pulando")
    case _:
        print("Comando desconhecido")`, "match|case|switch|switch case"],
]});

WCDEV.refs.push({ lang: "python", grupo: "Conceito", itens: [
  ["comentários", "Linhas que o Python **ignora**. Use {{#}} pra uma linha e aspas triplas pra várias.", `# isto é um comentário
"""
Isto também,
em várias linhas.
"""`, "comentario|comentar codigo|#"],
  ["indentação", "Os **espaços no começo da linha** mostram o que está dentro de um {{if}}, {{for}}, {{def}}... Use sempre 4 espaços.", `if True:
    print("dentro do if")
print("fora do if")`, "indentacao|identacao|espacos no comeco|recuo"],
  ["fatiamento (slicing)", "Pega um **pedaço** de texto ou lista: {{[inicio:fim:passo]}}.", `texto = "Python"
print(texto[0:3])    # Pyt
print(texto[-3:])    # hon
print(texto[::-1])   # nohtyP (invertido)
lista = [0, 1, 2, 3, 4]
print(lista[1:4])    # [1, 2, 3]`, "slicing|fatiar|pedaco do texto|inverter texto|substring"],
  ["list comprehension", "Cria uma lista **numa linha só**.", `quadrados = [n * n for n in range(5)]     # [0, 1, 4, 9, 16]
pares = [n for n in range(10) if n % 2 == 0]`, "compreensao de lista|lista em uma linha"],
  ["dict comprehension", "Cria um dicionário numa linha.", `quadrados = {n: n * n for n in range(4)}   # {0: 0, 1: 1, 2: 4, 3: 9}`, "compreensao de dicionario"],
  ["operador ternário", "Um {{if}} em **uma linha só**.", `idade = 20
status = "maior" if idade >= 18 else "menor"`, "ternario|if em uma linha"],
  ["desempacotamento", "Separa os valores de uma lista/tupla em **várias variáveis**.", `x, y = 10, 20
x, y = y, x          # troca os valores!
primeiro, *resto = [1, 2, 3, 4]`, "unpacking|trocar valores|desempacotar"],
  ["*args", "Deixa a função receber **quantos valores quiser**.", `def somar(*numeros):
    return sum(numeros)
print(somar(1, 2, 3, 4))   # 10`, "args|varios argumentos"],
  ["**kwargs", "Deixa a função receber **valores com nome**, quantos quiser.", `def perfil(**dados):
    for k, v in dados.items():
        print(k, "=", v)
perfil(nome="Ana", idade=15)`, "kwargs|argumentos nomeados"],
  ["parâmetros nomeados", "Você pode passar valores pelo **nome** do parâmetro, em qualquer ordem.", `def criar(nome, vida=100):
    print(nome, vida)
criar(vida=50, nome="Orc")`, "argumento com nome|keyword argument"],
  ["escopo", "Variáveis criadas **dentro** de uma função só existem lá dentro.", `def f():
    x = 5      # x só existe aqui
f()
# print(x)  -> NameError`, "escopo de variavel|variavel local"],
  ["recursão", "Quando uma função **chama ela mesma**. Precisa de um caso de parada!", `def fatorial(n):
    if n <= 1:
        return 1
    return n * fatorial(n - 1)
print(fatorial(5))   # 120`, "recursao|recursiva|funcao chama ela mesma"],
  ["mutável e imutável", "Listas, dicionários e sets **podem mudar** (mutáveis). Números, textos e tuplas **não** (imutáveis).", `a = [1]
b = a
b.append(2)
print(a)   # [1, 2] -> a e b são a mesma lista!`, "mutavel|imutavel"],
  ["f-string formatação", "Dentro das chaves dá pra formatar: casas decimais, zeros, alinhamento...", `preco = 4.5
print(f"R$ {preco:.2f}")      # R$ 4.50
print(f"{7:03d}")            # 007
print(f"{'oi':>10}")         # alinhado à direita
print(f"{0.856:.1%}")        # 85.6%`, "casas decimais|formatar dinheiro|2 casas decimais|porcentagem"],
  ["caracteres especiais", "Dentro de textos: {{\\n}} pula linha, {{\\t}} dá TAB, {{\\\\}} é uma barra. Coloque {{r}} antes das aspas pra ignorar isso.", `print("linha 1\\nlinha 2")
print("nome:\\tAna")
print(r"C:\\nova_pasta")`, "pular linha|quebra de linha python|barra invertida|\\n"],
  ["texto em várias linhas", "Use **aspas triplas**.", `mensagem = """Olá!
Este texto tem
várias linhas."""`, "aspas triplas|multilinha"],
  ["docstring", "Texto logo abaixo do {{def}} que **explica** a função. Aparece no {{help()}}.", `def area(l):
    """Calcula a área de um quadrado de lado l."""
    return l * l`, "documentar funcao"],
  ["type hints", "Dicas de **tipo** pra deixar o código mais claro (o Python não obriga).", `def saudacao(nome: str, vezes: int = 1) -> str:
    return ("Oi " + nome + "! ") * vezes`, "anotacao de tipo|tipagem"],
  ["if __name__ == '__main__'", "Faz um código rodar **só** quando o arquivo é executado direto (e não quando é importado).", `def main():
    print("Rodando!")

if __name__ == "__main__":
    main()`, "__name__|__main__|name main"],
  ["herança", "Uma classe **filha** recebe tudo da classe **mãe** e pode mudar ou adicionar coisas.", `class Animal:
    def falar(self):
        print("...")

class Gato(Animal):
    def falar(self):
        print("Miau")

Gato().falar()`, "heranca|classe filha|herdar"],
  ["polimorfismo", "Objetos diferentes respondendo ao **mesmo método** cada um do seu jeito.", `for bicho in [Gato(), Cachorro()]:
    bicho.falar()`, "polimorfismo"],
  ["encapsulamento", "Esconder detalhes internos. Em Python se usa {{_}} ou {{__}} no começo do nome como aviso de \"privado\".", `class Conta:
    def __init__(self):
        self.__saldo = 0
    def depositar(self, v):
        self.__saldo += v
    def saldo(self):
        return self.__saldo`, "atributo privado|privado"],
  ["métodos mágicos", "Métodos com {{__}} que mudam o comportamento do objeto: {{__str__}} (print), {{__len__}} (len), {{__add__}} (+)...", `class Ponto:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __str__(self):
        return f"({self.x}, {self.y})"
    def __add__(self, o):
        return Ponto(self.x + o.x, self.y + o.y)

print(Ponto(1, 2) + Ponto(3, 4))   # (4, 6)`, "__str__|__len__|__add__|__repr__|dunder"],
  ["decorador", "Uma função que **embrulha** outra pra adicionar comportamento. Usa {{@}}.", `def avisar(func):
    def nova(*a, **k):
        print("Chamando", func.__name__)
        return func(*a, **k)
    return nova

@avisar
def oi():
    print("Oi!")

oi()`, "decorator|decoradores|@"],
  ["gerador", "Função com {{yield}} que produz valores **sob demanda** (economiza memória).", `quadrados = (n * n for n in range(1000000))   # não cria tudo de uma vez
print(next(quadrados))`, "generator expression|geradores"],
  ["iterável", "Qualquer coisa que dá pra percorrer com {{for}}: listas, textos, dicionários, arquivos, {{range}}...", `for letra in "oi":
    print(letra)`, "iteravel|iterable"],
  ["matriz", "Uma **lista de listas**. Ótima pra tabuleiros e mapas de jogos.", `tabuleiro = [
    ["X", "O", "X"],
    [" ", "X", "O"],
    ["O", " ", "X"],
]
print(tabuleiro[1][2])   # O
for linha in tabuleiro:
    print(" | ".join(linha))`, "lista de listas|tabuleiro|matriz python|jogo da velha"],
  ["cópia profunda", "{{.copy()}} copia só o primeiro nível. Pra listas dentro de listas, use {{copy.deepcopy}}.", `import copy
a = [[1, 2], [3]]
b = copy.deepcopy(a)
b[0].append(9)
print(a)   # [[1, 2], [3]]`, "deepcopy|copia rasa"],
  ["validar input", "Repita a pergunta até o usuário digitar algo válido.", `while True:
    idade = input("Idade: ")
    if idade.isdigit():
        idade = int(idade)
        break
    print("Digite só números!")`, "validar entrada|validacao"],
  ["menu no terminal", "Um loop com opções, base de muitos programas.", `while True:
    print("1 - Jogar\\n2 - Sair")
    op = input("> ")
    if op == "1":
        print("Jogando...")
    elif op == "2":
        break
    else:
        print("Opção inválida")`, "menu|menu de opcoes"],
  ["contador", "Variável que vai **somando** dentro de um loop.", `total = 0
for n in [5, 10, 15]:
    total += n
print(total)   # 30`, "acumulador|somar no loop|+="],
  ["operadores de atribuição", "Atalhos: {{+=}}, {{-=}}, {{*=}}, {{/=}}, {{//=}}, {{%=}}, {{**=}}.", `vida = 100
vida -= 25   # 75
vida *= 2    # 150`, "+=|-=|*="],
  ["walrus :=", "Atribui e usa o valor **na mesma linha** (Python 3.8+).", `while (texto := input("> ")) != "sair":
    print("Você disse", texto)`, "walrus|:="],
  ["PEP 8", "O **guia de estilo** do Python: nomes em {{snake_case}}, 4 espaços, linhas curtas, espaço em volta de {{=}}.", `def calcular_media(lista_notas):
    total = sum(lista_notas)
    return total / len(lista_notas)`, "pep8|estilo de codigo|boas praticas|snake case"],
  ["ambiente virtual (venv)", "Uma pasta isolada com as bibliotecas do **seu projeto**.", `python -m venv venv
# Windows:
venv\\Scripts\\activate
# Linux/Mac:
source venv/bin/activate`, "venv|virtualenv|ambiente virtual", ],
  ["pip", "Instalador de **bibliotecas** do Python.", `pip install requests
pip list
pip uninstall requests
pip freeze > requirements.txt
pip install -r requirements.txt`, "instalar biblioteca|requirements.txt|pip install"],
  ["criar seu próprio módulo", "Qualquer arquivo {{.py}} pode ser importado por outro na mesma pasta.", `# arquivo: ferramentas.py
def dobro(n):
    return n * 2

# arquivo: main.py
from ferramentas import dobro
print(dobro(4))`, "importar meu arquivo|modulo proprio|outro arquivo"],
  ["dataclass", "Cria classes de dados **sem escrever** {{__init__}}.", `from dataclasses import dataclass

@dataclass
class Item:
    nome: str
    preco: float = 0.0

espada = Item("Espada", 50)
print(espada)`, "dataclasses"],
  ["enum", "Um conjunto de **opções fixas** com nome.", `from enum import Enum

class Cor(Enum):
    AZUL = 1
    PRETO = 2

print(Cor.AZUL.name)`, "enumeracao"],
  ["try else", "O {{else}} do {{try}} roda **só se não deu erro**.", `try:
    n = int(input("Número: "))
except ValueError:
    print("Inválido")
else:
    print("Dobro:", n * 2)`, ""],
  ["criar sua exceção", "Faça sua própria classe de erro herdando de {{Exception}}.", `class SemVidaError(Exception):
    pass

raise SemVidaError("O jogador morreu")`, "excecao personalizada|erro personalizado"],
  ["teste com unittest", "Testes automáticos pra garantir que seu código funciona.", `import unittest

def soma(a, b):
    return a + b

class TestSoma(unittest.TestCase):
    def test_basico(self):
        self.assertEqual(soma(2, 3), 5)

unittest.main()`, "testes|teste automatico|unittest"],
  ["números aleatórios", "Use o módulo {{random}}.", `import random
print(random.randint(1, 100))`, "numero aleatorio|sortear numero"],
  ["comparar textos", "{{==}} compara exato (maiúsculas importam). Use {{.lower()}} pra ignorar.", `resposta = input("Continuar? ")
if resposta.lower() in ("s", "sim"):
    print("Continuando")`, "comparar string|ignorar maiusculas"],
  ["números grandes", "Python aguenta inteiros **gigantes** e aceita {{_}} pra separar.", `populacao = 8_000_000_000
print(2 ** 100)`, "numero grande|separador de milhar"],
  ["problema do float", "Decimais no computador não são exatos: {{0.1 + 0.2}} dá {{0.30000000000000004}}. Use {{round}} ou o módulo {{decimal}}.", `print(0.1 + 0.2)            # 0.30000000000000004
print(round(0.1 + 0.2, 2))  # 0.3`, "0.1 + 0.2|float impreciso|conta errada"],
]});

WCDEV.refs.push({ lang: "python", grupo: "Erro (exceção)", itens: [
  ["SyntaxError", "Você escreveu algo que o Python **não entende**: faltou {{:}}, aspas, parênteses, ou usou {{=}} no lugar de {{==}}.", `# errado:
if x = 5
# certo:
if x == 5:
    pass`, "erro de sintaxe|invalid syntax"],
  ["IndentationError", "Os **espaços no começo da linha** estão errados. Tudo dentro do mesmo bloco precisa ter o mesmo recuo.", `# errado:
if True:
print("oi")
# certo:
if True:
    print("oi")`, "expected an indented block|unexpected indent|erro de indentacao"],
  ["TabError", "Você misturou **TAB e espaços**. Use só espaços (configure o editor).", ``, "inconsistent use of tabs"],
  ["NameError", "Usou um **nome que não existe**: variável escrita errado, ou usada antes de ser criada.", `nome = "Ana"
print(nmoe)   # NameError: name 'nmoe' is not defined`, "is not defined|nao esta definido"],
  ["TypeError", "Operação com o **tipo errado**, como somar texto com número.", `idade = 15
print("Idade: " + idade)       # TypeError
print("Idade: " + str(idade))  # certo`, "can only concatenate|unsupported operand|nao e possivel somar texto"],
  ["ValueError", "O tipo está certo mas o **valor** não serve, como {{int(\"abc\")}}.", `try:
    n = int("abc")
except ValueError:
    print("Não é número!")`, "invalid literal for int"],
  ["ZeroDivisionError", "Tentou **dividir por zero**.", `if divisor != 0:
    print(10 / divisor)`, "division by zero|divisao por zero"],
  ["IndexError", "Tentou pegar uma **posição que não existe** na lista.", `lista = [1, 2, 3]
print(lista[3])   # IndexError: só vai até 2`, "list index out of range|fora do intervalo"],
  ["KeyError", "Tentou pegar uma **chave que não existe** no dicionário. Use {{.get()}}.", `d = {"a": 1}
print(d.get("b", "não tem"))`, "chave nao existe"],
  ["AttributeError", "O objeto **não tem** esse método ou atributo (às vezes é só erro de digitação).", `x = 5
x.append(1)   # int não tem append`, "has no attribute|nao tem atributo"],
  ["ModuleNotFoundError", "O módulo **não está instalado** ou o nome está errado. Instale com {{pip install nome}}.", `pip install pygame`, "no module named|modulo nao encontrado"],
  ["ImportError", "O módulo existe mas aquilo que você quer importar dele não.", `from math import raiz   # não existe, o certo é sqrt`, "cannot import name"],
  ["FileNotFoundError", "O **arquivo não foi encontrado**. Confira o nome e a pasta onde o programa está rodando.", `import os
print(os.getcwd())   # mostra a pasta atual`, "no such file or directory|arquivo nao encontrado"],
  ["PermissionError", "Sem **permissão** pra abrir ou mudar o arquivo (talvez esteja aberto em outro programa).", ``, "permission denied|sem permissao"],
  ["RecursionError", "A função chamou ela mesma **vezes demais** (faltou caso de parada).", ``, "maximum recursion depth"],
  ["KeyboardInterrupt", "Acontece quando você aperta **Ctrl + C** pra parar o programa.", `try:
    while True:
        pass
except KeyboardInterrupt:
    print("Saindo...")`, "ctrl c"],
  ["UnboundLocalError", "Usou uma variável dentro da função antes de criar. Normalmente faltou {{global}}.", `pontos = 0
def ganhar():
    global pontos
    pontos += 1`, "referenced before assignment"],
  ["StopIteration", "Acabaram os itens do iterador (o {{for}} cuida disso sozinho).", ``, ""],
  ["OverflowError", "O número ficou **grande demais** pra um float.", ``, ""],
  ["RuntimeError", "Erro genérico durante a execução.", ``, ""],
  ["AssertionError", "Um {{assert}} falhou.", ``, ""],
  ["NotImplementedError", "Usado pra dizer que um método **ainda não foi feito**.", `class Forma:
    def area(self):
        raise NotImplementedError`, ""],
  ["UnicodeDecodeError", "Problema de **acentos** ao ler arquivo. Use {{encoding=\"utf-8\"}}.", `open("a.txt", encoding="utf-8")`, "erro de acento|codificacao"],
  ["EOFError", "O {{input()}} não recebeu nada (o arquivo/entrada acabou).", ``, ""],
  ["MemoryError", "Acabou a **memória** (lista gigante demais, por exemplo).", ``, ""],
  ["Exception", "A classe **mãe** de quase todos os erros. {{except Exception}} pega qualquer um, mas é melhor ser específico.", `try:
    algo()
except Exception as e:
    print("Deu erro:", e)`, "pegar qualquer erro"],
]});

WCDEV.refs.push({ lang: "python", grupo: "Módulo random", itens: [
  ["random.randint", "Número inteiro **aleatório** entre dois valores (os dois entram).", `import random
dado = random.randint(1, 6)`, "dado|sortear inteiro"],
  ["random.random", "Número decimal aleatório entre 0 e 1.", `import random
if random.random() < 0.1:
    print("10% de chance: item raro!")`, "chance|probabilidade"],
  ["random.uniform", "Decimal aleatório entre dois valores.", `import random
print(random.uniform(1.5, 3.5))`, ""],
  ["random.choice", "Escolhe **um item** aleatório de uma lista.", `import random
print(random.choice(["pedra", "papel", "tesoura"]))`, "escolher aleatorio|item aleatorio|sortear da lista"],
  ["random.choices", "Escolhe vários itens (pode repetir) e aceita **pesos**.", `import random
raridade = random.choices(["comum", "raro", "lendário"], weights=[70, 25, 5])[0]`, "sorteio com peso|pesos|raridade"],
  ["random.sample", "Escolhe vários itens **sem repetir**.", `import random
print(random.sample(range(1, 61), 6))   # mega-sena`, "sortear sem repetir|loteria"],
  ["random.shuffle", "**Embaralha** a lista.", `import random
cartas = [1, 2, 3, 4]
random.shuffle(cartas)`, "embaralhar"],
  ["random.seed", "Fixa a \"semente\": os números aleatórios saem **sempre iguais** (bom pra testes).", `import random
random.seed(42)`, "semente"],
]});

WCDEV.refs.push({ lang: "python", grupo: "Módulo math", itens: [
  ["math.sqrt", "**Raiz quadrada**.", `import math
print(math.sqrt(49))   # 7.0`, "raiz quadrada|raiz"],
  ["math.pi", "O número **π** (3.14159...).", `import math
area = math.pi * raio ** 2`, "pi|numero pi|area do circulo"],
  ["math.floor", "Arredonda **pra baixo**.", `import math
print(math.floor(3.9))   # 3`, "arredondar para baixo"],
  ["math.ceil", "Arredonda **pra cima**.", `import math
print(math.ceil(3.1))   # 4`, "arredondar para cima"],
  ["math.factorial", "**Fatorial** (5! = 120).", `import math
print(math.factorial(5))`, "fatorial"],
  ["math.gcd", "**MDC** (maior divisor comum).", `import math
print(math.gcd(12, 18))   # 6`, "mdc|maior divisor comum"],
  ["math.lcm", "**MMC** (menor múltiplo comum).", `import math
print(math.lcm(4, 6))   # 12`, "mmc|minimo multiplo comum"],
  ["math.sin / cos / tan", "Seno, cosseno, tangente (o ângulo vai em **radianos**).", `import math
print(math.sin(math.radians(30)))   # 0.5`, "seno|cosseno|tangente|trigonometria"],
  ["math.radians", "Converte **graus em radianos** ({{math.degrees}} faz o contrário).", `import math
print(math.radians(180))   # 3.14159...`, "graus para radianos|degrees"],
  ["math.log", "**Logaritmo** (natural, ou na base que você escolher).", `import math
print(math.log(100, 10))   # 2.0
print(math.log2(8))        # 3.0`, "logaritmo|log"],
  ["math.hypot", "Calcula a **hipotenusa** (ou distância entre dois pontos).", `import math
print(math.hypot(3, 4))   # 5.0`, "hipotenusa|distancia entre pontos|pitagoras"],
  ["math.inf", "Representa o **infinito**. Bom pra começar uma busca de menor valor.", `import math
menor = math.inf`, "infinito"],
  ["math.isclose", "Compara decimais **quase iguais**.", `import math
print(math.isclose(0.1 + 0.2, 0.3))   # True`, ""],
  ["math.trunc", "Corta a parte decimal.", `import math
print(math.trunc(-3.7))   # -3`, "truncar"],
]});

WCDEV.refs.push({ lang: "python", grupo: "Módulo time e datetime", itens: [
  ["time.sleep", "**Espera** alguns segundos.", `import time
print("3...")
time.sleep(1)
print("2...")`, "esperar|pausar|delay|aguardar"],
  ["time.time", "Segundos desde 1970. Ótimo pra **medir tempo**.", `import time
inicio = time.time()
# ... código ...
print("Levou", time.time() - inicio, "segundos")`, "cronometro|medir tempo"],
  ["time.perf_counter", "Cronômetro mais **preciso** pra medir desempenho.", `import time
t = time.perf_counter()
sum(range(10**6))
print(time.perf_counter() - t)`, ""],
  ["time.strftime", "Hora atual formatada.", `import time
print(time.strftime("%H:%M:%S"))`, "hora atual"],
  ["datetime.now", "**Data e hora** de agora.", `from datetime import datetime
agora = datetime.now()
print(agora.year, agora.month, agora.day, agora.hour)`, "data atual|hora agora|data de hoje"],
  ["date.today", "Só a **data** de hoje.", `from datetime import date
print(date.today())`, "dia de hoje"],
  ["strftime", "Formata data como **texto** brasileiro: {{%d}} dia, {{%m}} mês, {{%Y}} ano, {{%H}} hora, {{%M}} minuto.", `from datetime import datetime
print(datetime.now().strftime("%d/%m/%Y %H:%M"))`, "formatar data|data brasileira|dd/mm/yyyy"],
  ["strptime", "Transforma **texto em data**.", `from datetime import datetime
d = datetime.strptime("25/12/2026", "%d/%m/%Y")`, "texto para data"],
  ["timedelta", "Soma ou subtrai **dias, horas, minutos** de uma data.", `from datetime import date, timedelta
print(date.today() + timedelta(days=30))
idade_dias = (date.today() - date(2010, 5, 1)).days`, "somar dias|diferenca entre datas|quantos dias"],
  ["calendar", "Mostra **calendários** e diz se o ano é bissexto.", `import calendar
print(calendar.month(2026, 12))
print(calendar.isleap(2028))   # True`, "calendario|ano bissexto"],
]});

WCDEV.refs.push({ lang: "python", grupo: "Arquivos e sistema", itens: [
  ["os.listdir", "Lista os **arquivos** de uma pasta.", `import os
for nome in os.listdir("."):
    print(nome)`, "listar arquivos|arquivos da pasta"],
  ["os.path.exists", "Testa se um arquivo ou pasta **existe**.", `import os
if os.path.exists("save.txt"):
    print("Tem save!")`, "arquivo existe|verificar arquivo"],
  ["os.mkdir", "**Cria uma pasta** ({{os.makedirs}} cria várias de uma vez).", `import os
os.makedirs("projetos/jogo", exist_ok=True)`, "criar pasta|makedirs"],
  ["os.remove", "**Apaga** um arquivo.", `import os
os.remove("temp.txt")`, "apagar arquivo|deletar arquivo"],
  ["os.rename", "**Renomeia** ou move um arquivo.", `import os
os.rename("velho.txt", "novo.txt")`, "renomear arquivo"],
  ["os.getcwd", "Mostra a **pasta atual** onde o programa está rodando.", `import os
print(os.getcwd())`, "pasta atual|diretorio atual"],
  ["os.path.join", "Junta partes de um caminho do jeito certo pro sistema.", `import os
caminho = os.path.join("imagens", "foto.png")`, "caminho do arquivo"],
  ["os.system", "Roda um **comando do terminal**.", `import os
os.system("cls" if os.name == "nt" else "clear")   # limpa a tela`, "limpar tela|limpar terminal|cls|clear"],
  ["os.environ", "Lê **variáveis de ambiente** (bom pra guardar senhas fora do código).", `import os
token = os.environ.get("MEU_TOKEN")`, "variavel de ambiente"],
  ["pathlib.Path", "Jeito moderno de trabalhar com **caminhos e arquivos**.", `from pathlib import Path
p = Path("notas.txt")
p.write_text("Olá!", encoding="utf-8")
print(p.read_text(encoding="utf-8"))
for img in Path(".").glob("*.png"):
    print(img.name)`, "pathlib|read_text|write_text"],
  ["shutil", "**Copia, move e apaga** pastas inteiras, e cria zips.", `import shutil
shutil.copy("a.txt", "backup/a.txt")
shutil.move("a.txt", "outra_pasta/")
shutil.make_archive("projeto", "zip", "pasta_projeto")`, "copiar arquivo|mover arquivo|zipar pasta"],
  ["sys.argv", "Lista dos **argumentos** passados no terminal.", `import sys
# python app.py Ana
print("Olá", sys.argv[1])`, "argumentos terminal"],
  ["sys.exit", "**Fecha** o programa na hora.", `import sys
if erro:
    sys.exit("Algo deu errado")`, "fechar programa|encerrar programa|sair do programa"],
  ["sys.version", "Mostra a **versão** do Python.", `import sys
print(sys.version)`, "versao do python"],
  ["zipfile", "Lê e cria arquivos **.zip**.", `import zipfile
with zipfile.ZipFile("fotos.zip", "w") as z:
    z.write("foto1.png")`, "zip|compactar"],
  ["glob", "Procura arquivos por **padrão** ({{*.txt}}).", `import glob
print(glob.glob("*.py"))`, "procurar arquivos"],
  ["subprocess", "Roda outros programas e pega a saída.", `import subprocess
r = subprocess.run(["python", "--version"], capture_output=True, text=True)
print(r.stdout)`, "rodar programa"],
]});

WCDEV.refs.push({ lang: "python", grupo: "Dados (json, csv, sqlite)", itens: [
  ["json.dumps", "Transforma dicionário/lista em **texto JSON**.", `import json
dados = {"nome": "Ana", "nivel": 3}
texto = json.dumps(dados, indent=2, ensure_ascii=False)`, "converter para json|dicionario para json"],
  ["json.loads", "Transforma **texto JSON** em dicionário/lista.", `import json
d = json.loads('{"vida": 100}')
print(d["vida"])`, "ler json texto"],
  ["json.dump", "**Salva** dados num arquivo JSON (ótimo pra save de jogo).", `import json
with open("save.json", "w", encoding="utf-8") as f:
    json.dump({"moedas": 50}, f, indent=2)`, "salvar json|save de jogo|salvar progresso|salvar o jogo|salvar jogo|salvar dados em arquivo"],
  ["json.load", "**Lê** um arquivo JSON.", `import json
with open("save.json", encoding="utf-8") as f:
    save = json.load(f)`, "carregar json|abrir json"],
  ["csv.reader", "Lê planilhas **.csv** linha por linha.", `import csv
with open("notas.csv", encoding="utf-8") as f:
    for linha in csv.reader(f):
        print(linha)`, "ler csv|planilha"],
  ["csv.writer", "Escreve arquivos **.csv** (abre no Excel).", `import csv
with open("notas.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["nome", "nota"])
    w.writerow(["Ana", 9])`, "escrever csv|criar planilha|excel"],
  ["csv.DictReader", "Lê CSV onde cada linha vira um **dicionário**.", `import csv
with open("notas.csv", encoding="utf-8") as f:
    for linha in csv.DictReader(f):
        print(linha["nome"], linha["nota"])`, ""],
  ["sqlite3", "Banco de dados **SQL** dentro de um arquivo, sem instalar nada.", `import sqlite3
con = sqlite3.connect("jogo.db")
cur = con.cursor()
cur.execute("CREATE TABLE IF NOT EXISTS jogadores (nome TEXT, pontos INT)")
cur.execute("INSERT INTO jogadores VALUES (?, ?)", ("Ana", 100))
con.commit()
for linha in cur.execute("SELECT * FROM jogadores"):
    print(linha)`, "banco de dados|sql|database|sqlite"],
  ["pickle", "Salva **qualquer objeto** Python num arquivo. ⚠️ Nunca abra pickle de fonte desconhecida.", `import pickle
with open("obj.pkl", "wb") as f:
    pickle.dump(minha_lista, f)`, ""],
]});

WCDEV.refs.push({ lang: "python", grupo: "Módulo útil", itens: [
  ["collections.Counter", "**Conta** quantas vezes cada coisa aparece.", `from collections import Counter
c = Counter("abracadabra")
print(c.most_common(2))   # [('a', 5), ('b', 2)]`, "contar ocorrencias|contar palavras|mais comum"],
  ["collections.defaultdict", "Dicionário que cria um **valor padrão** sozinho.", `from collections import defaultdict
grupos = defaultdict(list)
grupos["frutas"].append("maçã")`, ""],
  ["collections.deque", "Fila com inserção/remoção **rápida nas duas pontas**.", `from collections import deque
fila = deque([1, 2, 3])
fila.appendleft(0)
fila.popleft()`, "fila|queue"],
  ["collections.namedtuple", "Tupla com **nomes** nos campos.", `from collections import namedtuple
Ponto = namedtuple("Ponto", "x y")
p = Ponto(3, 4)
print(p.x)`, ""],
  ["itertools.permutations", "Todas as **ordens possíveis**.", `from itertools import permutations
print(list(permutations("abc", 2)))`, "permutacao|todas as combinacoes de ordem"],
  ["itertools.combinations", "Todos os **grupos** possíveis (sem importar a ordem).", `from itertools import combinations
print(list(combinations([1, 2, 3], 2)))   # [(1,2), (1,3), (2,3)]`, "combinacao|combinacoes"],
  ["itertools.product", "Todas as combinações entre listas (tipo for dentro de for).", `from itertools import product
for cor, tam in product(["azul", "preto"], ["P", "M"]):
    print(cor, tam)`, "produto cartesiano"],
  ["itertools.cycle", "Repete uma sequência **pra sempre**.", `from itertools import cycle
turnos = cycle(["Jogador 1", "Jogador 2"])
print(next(turnos))`, "repetir infinito|alternar turnos"],
  ["itertools.chain", "Junta várias listas numa sequência só.", `from itertools import chain
print(list(chain([1, 2], [3], [4, 5])))`, ""],
  ["functools.reduce", "**Reduz** a lista a um valor só, aplicando uma função.", `from functools import reduce
print(reduce(lambda a, b: a * b, [1, 2, 3, 4]))   # 24`, ""],
  ["functools.lru_cache", "**Guarda** resultados de uma função pra não recalcular (deixa recursão muito mais rápida).", `from functools import lru_cache

@lru_cache
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)

print(fib(100))`, "cache|memoizacao|fibonacci"],
  ["re (regex)", "**Expressões regulares**: procurar padrões em textos (e-mails, telefones, números).", `import re
texto = "ligue 81 99999-1234 ou 81 98888-0000"
print(re.findall(r"\\d{5}-\\d{4}", texto))
print(re.sub(r"\\d", "#", "senha123"))   # senha###
if re.match(r"^[\\w.]+@[\\w.]+\\.\\w+$", "ana@gmail.com"):
    print("e-mail válido")`, "regex|expressao regular|re.findall|re.sub|re.search|validar email"],
  ["string", "Listas prontas de **letras, números e símbolos**.", `import string
print(string.ascii_letters)
print(string.digits)
print(string.punctuation)`, "alfabeto|letras do alfabeto"],
  ["secrets", "Números aleatórios **seguros** (pra senhas e tokens).", `import secrets, string
chars = string.ascii_letters + string.digits
senha = "".join(secrets.choice(chars) for _ in range(12))`, "gerar senha|senha aleatoria|token"],
  ["hashlib", "Gera **hash** (impressão digital) de textos ou arquivos.", `import hashlib
print(hashlib.sha256("senha".encode()).hexdigest())`, "hash|sha256|md5"],
  ["uuid", "Gera **IDs únicos**.", `import uuid
print(uuid.uuid4())`, "id unico"],
  ["statistics", "**Média, mediana, moda** e desvio padrão.", `import statistics as st
notas = [7, 8, 8, 10]
print(st.mean(notas), st.median(notas), st.mode(notas))`, "media|mediana|moda|desvio padrao|estatistica"],
  ["decimal", "Contas com decimais **exatos** (bom pra dinheiro).", `from decimal import Decimal
print(Decimal("0.1") + Decimal("0.2"))   # 0.3`, "dinheiro exato"],
  ["fractions", "Trabalha com **frações**.", `from fractions import Fraction
print(Fraction(1, 3) + Fraction(1, 6))   # 1/2`, "fracao|fracoes"],
  ["heapq", "**Fila de prioridade**: pega sempre o menor rapidinho.", `import heapq
h = [5, 1, 8]
heapq.heapify(h)
print(heapq.heappop(h))   # 1`, "fila de prioridade|heap"],
  ["bisect", "Insere numa lista **mantendo ordenada**.", `import bisect
lista = [1, 3, 5]
bisect.insort(lista, 4)   # [1, 3, 4, 5]`, ""],
  ["pprint", "Mostra dicionários e listas grandes de forma **organizada**.", `from pprint import pprint
pprint({"a": [1, 2, 3], "b": {"c": 4}})`, "imprimir bonito"],
  ["textwrap", "Quebra texto longo em linhas de certo tamanho.", `import textwrap
print(textwrap.fill("um texto bem comprido...", width=20))`, ""],
  ["timeit", "Mede **quanto tempo** um código leva.", `import timeit
print(timeit.timeit("sum(range(100))", number=10000))`, ""],
  ["logging", "Registra **mensagens de log** (melhor que vários prints).", `import logging
logging.basicConfig(level=logging.INFO)
logging.info("Jogo iniciado")
logging.warning("Pouca vida!")`, "log|registrar log"],
  ["argparse", "Cria programas de terminal com **opções** ({{--nome}}).", `import argparse
p = argparse.ArgumentParser()
p.add_argument("--nome", default="mundo")
args = p.parse_args()
print("Olá", args.nome)`, ""],
  ["threading", "Roda tarefas **ao mesmo tempo** (em paralelo).", `import threading, time

def baixar():
    time.sleep(2)
    print("Baixou!")

t = threading.Thread(target=baixar)
t.start()
print("Enquanto isso...")`, "thread|paralelo|ao mesmo tempo"],
  ["asyncio", "Programação **assíncrona** (muitas esperas ao mesmo tempo).", `import asyncio
asyncio.run(main())`, ""],
  ["getpass", "Lê uma **senha sem mostrar** na tela.", `from getpass import getpass
senha = getpass("Senha: ")`, "esconder senha|digitar senha"],
  ["webbrowser", "**Abre um site** no navegador.", `import webbrowser
webbrowser.open("https://www.python.org")`, "abrir site|abrir navegador"],
  ["platform", "Informações do **sistema operacional**.", `import platform
print(platform.system())   # Windows, Linux, Darwin`, "sistema operacional"],
  ["copy", "Copia objetos ({{copy.copy}} raso, {{copy.deepcopy}} completo).", `import copy
b = copy.deepcopy(a)`, ""],
  ["typing", "Tipos extras pra **type hints**: {{List}}, {{Dict}}, {{Optional}}...", `from typing import Optional
def achar(nome: str) -> Optional[int]:
    return None`, "optional"],
]});

WCDEV.refs.push({ lang: "python", grupo: "Biblioteca externa (pip install)", itens: [
  ["requests", "Faz **requisições na internet** (APIs, sites). Instale: {{pip install requests}}.", `import requests
r = requests.get("https://api.github.com")
print(r.status_code)
dados = r.json()`, "api|requisicao|internet|baixar da internet|http"],
  ["pygame", "Biblioteca pra fazer **jogos 2D**. Instale: {{pip install pygame}}.", `import pygame
pygame.init()
tela = pygame.display.set_mode((800, 600))
relogio = pygame.time.Clock()
x = 400

rodando = True
while rodando:
    for evento in pygame.event.get():
        if evento.type == pygame.QUIT:
            rodando = False
    teclas = pygame.key.get_pressed()
    if teclas[pygame.K_LEFT]:  x -= 5
    if teclas[pygame.K_RIGHT]: x += 5

    tela.fill((5, 7, 13))
    pygame.draw.rect(tela, (30, 144, 255), (x, 500, 50, 50))
    pygame.display.flip()
    relogio.tick(60)

pygame.quit()`, "fazer jogo|jogo em python|criar jogo|game"],
  ["tkinter", "Cria **janelas** com botões e campos (já vem com o Python).", `import tkinter as tk

def clicar():
    rotulo.config(text=f"Olá, {campo.get()}!")

janela = tk.Tk()
janela.title("WC DEV")
janela.geometry("300x150")
campo = tk.Entry(janela)
campo.pack(pady=5)
tk.Button(janela, text="Enviar", command=clicar).pack()
rotulo = tk.Label(janela, text="")
rotulo.pack()
janela.mainloop()`, "janela|interface grafica|gui|botao python|tela com botao"],
  ["turtle", "Desenha com uma **tartaruguinha** (já vem com o Python). Ótimo pra iniciantes.", `import turtle
t = turtle.Turtle()
t.color("blue")
for _ in range(4):
    t.forward(100)
    t.left(90)
turtle.done()`, "desenhar|tartaruga|desenho python"],
  ["flask", "Cria **sites e APIs** com Python. Instale: {{pip install flask}}.", `from flask import Flask
app = Flask(__name__)

@app.route("/")
def inicio():
    return "<h1>Meu site em Python!</h1>"

app.run(debug=True)`, "site com python|servidor|backend|api python"],
  ["django", "Framework **completo** pra sites grandes (login, banco de dados, admin). Instale: {{pip install django}}.", `django-admin startproject meusite
cd meusite
python manage.py runserver`, "framework web"],
  ["pandas", "Analisa **tabelas e planilhas** de dados. Instale: {{pip install pandas}}.", `import pandas as pd
df = pd.read_csv("vendas.csv")
print(df.head())
print(df["valor"].sum())
print(df.groupby("mes")["valor"].mean())`, "analise de dados|tabela de dados|dataframe"],
  ["numpy", "Contas rápidas com **listas de números** e matrizes. Instale: {{pip install numpy}}.", `import numpy as np
a = np.array([1, 2, 3])
print(a * 2)        # [2 4 6]
print(a.mean())`, "matrizes|calculo cientifico"],
  ["matplotlib", "Cria **gráficos**. Instale: {{pip install matplotlib}}.", `import matplotlib.pyplot as plt
plt.plot([1, 2, 3, 4], [10, 20, 15, 30])
plt.title("Meu gráfico")
plt.show()`, "grafico|graficos|plotar"],
  ["pillow", "Edita **imagens**. Instale: {{pip install pillow}}.", `from PIL import Image
img = Image.open("foto.png")
img = img.resize((200, 200)).convert("L")   # menor e preto e branco
img.save("nova.png")`, "editar imagem|redimensionar imagem|pil"],
  ["beautifulsoup", "Lê e extrai coisas do **HTML** de sites. Instale: {{pip install beautifulsoup4}}.", `from bs4 import BeautifulSoup
import requests
html = requests.get("https://example.com").text
sopa = BeautifulSoup(html, "html.parser")
print(sopa.title.text)`, "web scraping|raspar site|bs4"],
  ["discord.py", "Cria **bots pro Discord**. Instale: {{pip install discord.py}}.", `import discord
intents = discord.Intents.default()
intents.message_content = True
bot = discord.Client(intents=intents)

@bot.event
async def on_message(msg):
    if msg.content == "!oi":
        await msg.channel.send("Olá!")

bot.run("SEU_TOKEN")`, "bot discord|discord"],
  ["pyautogui", "Controla o **mouse e teclado** pra automações. Instale: {{pip install pyautogui}}.", `import pyautogui
pyautogui.moveTo(100, 200)
pyautogui.write("Olá!", interval=0.1)`, "automacao|automatizar|mouse e teclado"],
  ["openpyxl", "Lê e cria arquivos **Excel (.xlsx)**. Instale: {{pip install openpyxl}}.", `from openpyxl import Workbook
wb = Workbook()
ws = wb.active
ws.append(["Nome", "Nota"])
ws.append(["Ana", 9])
wb.save("notas.xlsx")`, "excel python|xlsx|planilha excel"],
]});

/* =========================================================
   PYTHON — EXERCÍCIOS DO MODO TREINO (/treinar python)
   ========================================================= */
WCDEV.exercicios = WCDEV.exercicios || [];

WCDEV.exercicios.push(
  {
    lang: "python", nivel: 1,
    titulo: "Olá, mundo",
    enunciado: "Mostre na tela a frase **Olá, mundo!**",
    dica: "Use {{print(\"...\")}} com o texto entre aspas.",
    testes: [
      { re: /print\s*\(\s*["']Olá, mundo!?["']\s*\)/i, falta: "Use {{print(\"Olá, mundo!\")}}, com parênteses e aspas." },
    ],
    solucao: `print("Olá, mundo!")`,
  },
  {
    lang: "python", nivel: 1,
    titulo: "Pergunte o nome",
    enunciado: "Pergunte o nome do usuário com {{input}} e mostre **Prazer, NOME**.",
    dica: "Guarde numa variável: {{nome = input(\"Seu nome: \")}} e depois use print.",
    testes: [
      { re: /(\w+)\s*=\s*input\s*\(/, falta: "Guarde a resposta numa variável: {{nome = input(\"Seu nome: \")}}" },
      { re: /print\s*\([^)]*(Prazer)/i, falta: "Mostre a mensagem com {{print}} e a palavra **Prazer**." },
      { re: /print\s*\([^)]*\b(nome|n|name)\b|f["'][^"']*\{\s*\w+\s*\}/, falta: "Coloque a variável do nome dentro do print (com vírgula ou f-string)." },
    ],
    solucao: `nome = input("Seu nome: ")
print(f"Prazer, {nome}")`,
  },
  {
    lang: "python", nivel: 1,
    titulo: "Soma de dois números",
    enunciado: "Peça **dois números** ao usuário e mostre a **soma**.",
    dica: "O {{input}} devolve texto! Converta com {{int(input(...))}}.",
    testes: [
      { re: /(int|float)\s*\(\s*input\s*\(/, falta: "Converta pra número: {{a = int(input(\"Número: \"))}}" },
      { re: /(int|float)\s*\(\s*input[\s\S]*(int|float)\s*\(\s*input/, falta: "Faltou pedir o **segundo** número." },
      { re: /\w+\s*\+\s*\w+/, falta: "Some os dois com {{+}}." },
      { re: /print\s*\(/, falta: "Mostre o resultado com {{print}}." },
    ],
    solucao: `a = int(input("Primeiro número: "))
b = int(input("Segundo número: "))
print("Soma:", a + b)`,
  },
  {
    lang: "python", nivel: 2,
    titulo: "Maior de idade",
    enunciado: "Peça a idade. Se for **18 ou mais**, mostre **Maior de idade**; senão, **Menor de idade**.",
    dica: "{{if idade >= 18:}} e {{else:}}. Não esqueça os dois pontos e os 4 espaços!",
    testes: [
      { re: /int\s*\(\s*input\s*\(/, falta: "Converta a idade pra número: {{idade = int(input(\"Idade: \"))}}" },
      { re: /if\s+\w+\s*>=\s*18\s*:|if\s+\w+\s*>\s*17\s*:/, falta: "Use {{if idade >= 18:}} (com dois pontos)." },
      { re: /\n\s*else\s*:/, falta: "Faltou o {{else:}} pro caso contrário." },
      { re: /Maior de idade[\s\S]*Menor de idade|Menor de idade[\s\S]*Maior de idade/i, falta: "Mostre os dois textos: **Maior de idade** e **Menor de idade**." },
    ],
    solucao: `idade = int(input("Idade: "))
if idade >= 18:
    print("Maior de idade")
else:
    print("Menor de idade")`,
  },
  {
    lang: "python", nivel: 2,
    titulo: "Tabuada",
    enunciado: "Mostre a **tabuada do 7** (7 x 1 até 7 x 10) usando {{for}}.",
    dica: "{{for i in range(1, 11):}} e dentro {{print(7, \"x\", i, \"=\", 7 * i)}}",
    testes: [
      { re: /for\s+\w+\s+in\s+range\s*\(\s*1\s*,\s*11\s*\)\s*:/, falta: "Use {{for i in range(1, 11):}} (o 11 não entra, então vai até 10)." },
      { re: /7\s*\*\s*\w+|\w+\s*\*\s*7/, falta: "Calcule com {{7 * i}}." },
      { re: /\n[ \t]+print\s*\(/, falta: "O {{print}} tem que estar **dentro** do for (com 4 espaços na frente)." },
    ],
    solucao: `for i in range(1, 11):
    print(f"7 x {i} = {7 * i}")`,
  },
  {
    lang: "python", nivel: 2,
    titulo: "Lista de compras",
    enunciado: "Crie uma lista vazia {{compras}}, adicione **arroz** e **feijão** com {{append}} e mostre quantos itens ela tem.",
    dica: "{{compras = []}}, {{compras.append(\"arroz\")}} e {{len(compras)}}.",
    testes: [
      { re: /compras\s*=\s*\[\s*\]/, falta: "Crie a lista vazia: {{compras = []}}" },
      { re: /compras\.append\s*\(\s*["']arroz["']\s*\)/i, falta: "Adicione: {{compras.append(\"arroz\")}}" },
      { re: /compras\.append\s*\(\s*["']feij[aã]o["']\s*\)/i, falta: "Adicione: {{compras.append(\"feijão\")}}" },
      { re: /len\s*\(\s*compras\s*\)/, falta: "Mostre o tamanho com {{len(compras)}}." },
    ],
    solucao: `compras = []
compras.append("arroz")
compras.append("feijão")
print(len(compras))`,
  },
  {
    lang: "python", nivel: 2,
    titulo: "Função de dobro",
    enunciado: "Crie uma função {{dobro(n)}} que **retorna** o dobro do número, e mostre {{dobro(21)}}.",
    dica: "{{def dobro(n):}} e dentro {{return n * 2}}.",
    testes: [
      { re: /def\s+dobro\s*\(\s*\w+\s*\)\s*:/, falta: "Crie a função: {{def dobro(n):}}" },
      { re: /return\s+\w+\s*\*\s*2|return\s+2\s*\*\s*\w+|return\s+\w+\s*\+\s*\w+/, falta: "A função precisa de {{return n * 2}}." },
      { re: /print\s*\(\s*dobro\s*\(\s*21\s*\)\s*\)/, falta: "Mostre o resultado: {{print(dobro(21))}}" },
    ],
    solucao: `def dobro(n):
    return n * 2

print(dobro(21))`,
  },
  {
    lang: "python", nivel: 3,
    titulo: "Pares de 1 a 20",
    enunciado: "Mostre só os números **pares** de 1 a 20 usando {{for}} e {{if}}.",
    dica: "Um número é par quando {{n % 2 == 0}}.",
    testes: [
      { re: /for\s+\w+\s+in\s+range\s*\(/, falta: "Use um {{for}} com {{range}}." },
      { re: /%\s*2\s*==\s*0/, falta: "Teste se é par com {{n % 2 == 0}}." },
      { re: /if\s+[^:]+:/, falta: "Use um {{if}} dentro do for." },
    ],
    solucao: `for n in range(1, 21):
    if n % 2 == 0:
        print(n)`,
  },
  {
    lang: "python", nivel: 3,
    titulo: "Jogo de adivinhar",
    enunciado: "Sorteie um número de 1 a 10 com {{random}}. Peça palpites com {{while}} até o usuário acertar.",
    dica: "{{import random}}, {{segredo = random.randint(1, 10)}} e um {{while}} que pergunta até ser igual.",
    testes: [
      { re: /import\s+random|from\s+random\s+import/, falta: "Importe o módulo: {{import random}}" },
      { re: /randint\s*\(\s*1\s*,\s*10\s*\)/, falta: "Sorteie com {{random.randint(1, 10)}}" },
      { re: /while\s+[^:]+:/, falta: "Use um {{while}} pra repetir os palpites." },
      { re: /int\s*\(\s*input\s*\(/, falta: "Converta o palpite: {{int(input(\"Palpite: \"))}}" },
      { re: /==|!=/, falta: "Compare o palpite com o número secreto ({{==}} ou {{!=}})." },
    ],
    solucao: `import random

segredo = random.randint(1, 10)
palpite = 0
while palpite != segredo:
    palpite = int(input("Palpite (1 a 10): "))
print("Acertou!")`,
  },
  {
    lang: "python", nivel: 3,
    titulo: "Dicionário de jogador",
    enunciado: "Crie um dicionário {{jogador}} com **nome** e **vida** (100). Tire 30 de vida e mostre a vida.",
    dica: "{{jogador = {\"nome\": \"Ana\", \"vida\": 100} }} e {{jogador[\"vida\"] -= 30}}.",
    testes: [
      { re: /jogador\s*=\s*\{/, falta: "Crie o dicionário: {{jogador = { ... } }}" },
      { re: /["']nome["']\s*:/, falta: "Faltou a chave **\"nome\"**." },
      { re: /["']vida["']\s*:\s*100/, falta: "Faltou **\"vida\": 100**." },
      { re: /jogador\s*\[\s*["']vida["']\s*\]\s*(-=\s*30|=\s*jogador\s*\[\s*["']vida["']\s*\]\s*-\s*30)/, falta: "Tire a vida: {{jogador[\"vida\"] -= 30}}" },
      { re: /print\s*\([^)]*jogador\s*\[\s*["']vida["']\s*\]/, falta: "Mostre: {{print(jogador[\"vida\"])}}" },
    ],
    solucao: `jogador = {"nome": "Ana", "vida": 100}
jogador["vida"] -= 30
print(jogador["vida"])`,
  }
);
