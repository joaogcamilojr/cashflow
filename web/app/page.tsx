"use client";

import { useMemo, useState } from "react";

const currencies = [
  { code: "USD", amount: 4250, rate: 5.42, flag: "US" },
  { code: "EUR", amount: 1860, rate: 6.31, flag: "EU" },
  { code: "BRL", amount: 8240, rate: 1, flag: "BR" },
];

const rates: Record<string, number> = {
  USD: 5.42,
  EUR: 6.31,
  BRL: 1,
  UYU: 0.134,
  CLP: 0.0057,
  BTC: 628412,
};

const features = [
  [
    "01",
    "Tudo no seu idioma financeiro",
    "Veja cada compra na moeda original e o impacto real na sua moeda-base. Sem planilhas paralelas.",
  ],
  [
    "02",
    "Viagens sem sustos",
    "Crie uma viagem, defina o orçamento e acompanhe quanto ainda pode gastar por dia e por categoria.",
  ],
  [
    "03",
    "Bitcoin faz parte do patrimônio",
    "Acompanhe BTC junto de contas e moedas tradicionais, com posição e variação claramente separadas.",
  ],
  [
    "04",
    "Uma visão para cada país",
    "Dólar, euro, real, peso uruguaio e chileno reunidos em uma carteira global.",
  ],
];

function Mark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span
      className={"mark " + (inverse ? "mark-inverse" : "")}
      aria-hidden="true"
    >
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
function fmt(value: number, code: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: code,
    maximumFractionDigits: code === "BTC" ? 6 : 2,
  }).format(value);
}

export default function Home() {
  const [base, setBase] = useState("BRL");
  const [from, setFrom] = useState("USD");
  const [amount, setAmount] = useState(1000);
  const [openFaq, setOpenFaq] = useState(0);
  const converted = useMemo(
    () => (amount * rates[from]) / rates[base],
    [amount, from, base],
  );
  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#top">
          <Mark />
          <span>Cash Flow</span>
          <b>Global</b>
        </a>
        <div className="navlinks">
          <a href="#produto">Produto</a>
          <a href="#viajantes">Para viajantes</a>
          <a href="#cotacoes">Cotações</a>
          <a href="#seguranca">Segurança</a>
        </div>
        <div className="nav-actions">
          <a className="text-button" href="/login">
            Entrar
          </a>
          <a className="button button-small" href="#acesso">
            Quero acesso antecipado
          </a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> Finanças para quem vive entre moedas
            </div>
            <h1>
              Seu dinheiro não
              <br />
              tem <em>fronteiras.</em>
              <br />
              Seu controle também não.
            </h1>
            <p>
              Organize contas, viagens e patrimônio em múltiplas moedas — do
              real ao dólar, do peso ao Bitcoin — em uma única visão simples.
            </p>
            <div className="hero-actions">
              <a className="button" href="#acesso">
                Entrar na lista de espera <span>→</span>
              </a>
              <a className="watch" href="#produto">
                <i>▶</i> Ver como funciona
              </a>
            </div>
            <small>Sem cartão de crédito · Acesso antecipado gratuito</small>
          </div>
          <div
            className="product-scene"
            aria-label="Prévia do painel financeiro"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="float-card fx-card">
              <span>Cotação agora</span>
              <strong>USD 1 = R$ 5,42</strong>
              <small>+0,38% hoje</small>
            </div>
            <div className="app-card">
              <div className="app-top">
                <div className="app-brand">
                  <Mark />
                  <span>Cash Flow</span>
                  <b>Global</b>
                </div>
                <div className="avatar">JC</div>
              </div>
              <div className="balance">
                <span>Patrimônio global</span>
                <strong>{fmt(38742.8, base)}</strong>
                <small>↗ 2,8% este mês</small>
              </div>
              <div className="chart">
                <div className="chart-grid" />
                <svg viewBox="0 0 450 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#4e73df" stopOpacity=".32" />
                      <stop offset="1" stopColor="#4e73df" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 96 C35 84 45 88 72 72 S118 83 145 61 S190 69 212 43 S250 60 275 45 S315 50 337 27 S382 44 450 12 L450 120 L0 120Z"
                    fill="url(#area)"
                  />
                  <path
                    d="M0 96 C35 84 45 88 72 72 S118 83 145 61 S190 69 212 43 S250 60 275 45 S315 50 337 27 S382 44 450 12"
                    fill="none"
                    stroke="#4e73df"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="wallet-head">
                <b>Minhas moedas</b>
                <span>Ver todas</span>
              </div>
              <div className="wallets">
                {currencies.map((c) => (
                  <div className="wallet" key={c.code}>
                    <span className="flag">{c.flag}</span>
                    <div>
                      <b>{c.code}</b>
                      <small>{fmt(c.amount, c.code)}</small>
                    </div>
                    <strong>{fmt(c.amount * c.rate, base)}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="float-card trip-card">
              <span className="trip-icon">✦</span>
              <div>
                <small>Viagem · Montevidéu</small>
                <strong>72% do orçamento</strong>
                <span>
                  <i style={{ width: "72%" }} />
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="ticker">
          <span>
            USD / BRL <b>5,42</b> <i>▲ 0,38%</i>
          </span>
          <span>
            EUR / BRL <b>6,31</b> <i>▲ 0,22%</i>
          </span>
          <span>
            BTC / USD <b>115.950</b> <i>▲ 2,84%</i>
          </span>
          <span>
            UYU / BRL <b>0,134</b> <em>▼ 0,11%</em>
          </span>
          <span>
            CLP / BRL <b>0,0057</b> <i>▲ 0,07%</i>
          </span>
        </div>
      </section>

      <section className="problem shell" id="produto">
        <div className="section-kicker">O problema</div>
        <h2>
          Você viaja pelo mundo.
          <br />
          Suas finanças ficam para trás.
        </h2>
        <p className="section-lead">
          Aplicativos tradicionais entendem uma conta, uma moeda, um país. Sua
          vida já não funciona assim.
        </p>
        <div className="problem-grid">
          <div className="mess">
            <div className="receipt r1">
              Cartão internacional <b>USD 284,90</b>
              <small>Qual foi a cotação mesmo?</small>
            </div>
            <div className="receipt r2">
              Planilha viagem.xlsx <b>#REF!</b>
              <small>última edição há 12 dias</small>
            </div>
            <div className="receipt r3">
              Exchange <b>0,036 BTC</b>
              <small>fora do seu patrimônio</small>
            </div>
          </div>
          <div className="solution">
            <div className="solution-logo">
              <Mark inverse />
              <span>Cash Flow</span>
              <b>Global</b>
            </div>
            <h3>Uma visão. Todas as moedas.</h3>
            <p>
              O Cash Flow Global converte, organiza e contextualiza seu dinheiro
              sem esconder a moeda original.
            </p>
            <div className="chips">
              <span>USD</span>
              <span>EUR</span>
              <span>BRL</span>
              <span>UYU</span>
              <span>CLP</span>
              <span>₿ BTC</span>
              <span>+ 160</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="viajantes">
        <div className="shell">
          <div className="section-kicker light">Feito para uma vida global</div>
          <h2>
            Controle financeiro que
            <br />
            fala a língua da sua jornada.
          </h2>
          <div className="feature-list">
            {features.map((f, i) => (
              <article key={f[0]}>
                <span>{f[0]}</span>
                <div>
                  <h3>{f[1]}</h3>
                  <p>{f[2]}</p>
                </div>
                <div className="feature-visual">
                  <div className="visual-core">
                    {i === 0
                      ? "R$ 1.544,16"
                      : i === 1
                        ? "€ 86 / dia"
                        : i === 2
                          ? "₿ 0,036"
                          : "6 moedas"}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="converter shell" id="cotacoes">
        <div>
          <div className="section-kicker">Câmbio sem adivinhação</div>
          <h2>
            Antes de comprar,
            <br />
            saiba quanto custa.
          </h2>
          <p>
            Converta moedas com uma referência clara. No produto, cada
            lançamento preserva o valor e a moeda originais.
          </p>
          <div className="source-note">
            <span>●</span> Demonstração com valores ilustrativos
            <br />
            <small>
              Integração de dados em tempo real prevista para o produto.
            </small>
          </div>
        </div>
        <div className="converter-card">
          <label>Você tem</label>
          <div className="money-input">
            <input
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              inputMode="decimal"
            />
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              {Object.keys(rates).map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          <button
            className="swap"
            onClick={() => {
              const old = from;
              setFrom(base);
              setBase(old);
            }}
            aria-label="Inverter moedas"
          >
            ⇅
          </button>
          <label>Você terá aproximadamente</label>
          <div className="result">
            <strong>{fmt(converted, base)}</strong>
            <select value={base} onChange={(e) => setBase(e.target.value)}>
              {Object.keys(rates).map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          <p>
            1 {from} ≈{" "}
            {(rates[from] / rates[base]).toLocaleString("pt-BR", {
              maximumFractionDigits: 6,
            })}{" "}
            {base}
          </p>
        </div>
      </section>

      <section className="security" id="seguranca">
        <div className="shell security-grid">
          <div>
            <div className="section-kicker light">
              Seu dinheiro é assunto sério
            </div>
            <h2>
              Clareza no produto.
              <br />
              Responsabilidade nos dados.
            </h2>
          </div>
          <div className="security-items">
            <div>
              <span>01</span>
              <h3>Você mantém o controle</h3>
              <p>
                Seus dados financeiros são seus. Projetaremos exportação e
                exclusão sem aprisionamento.
              </p>
            </div>
            <div>
              <span>02</span>
              <h3>Menos dados, mais privacidade</h3>
              <p>
                Coletar somente o necessário, com consentimento claro e proteção
                desde a arquitetura.
              </p>
            </div>
            <div>
              <span>03</span>
              <h3>Informação, não custódia</h3>
              <p>
                O produto organiza e acompanha. Não guarda seu dinheiro nem suas
                chaves de Bitcoin.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="faq shell">
        <div>
          <div className="section-kicker">Perguntas reais</div>
          <h2>
            O que você
            <br />
            precisa saber.
          </h2>
        </div>
        <div>
          {[
            [
              "O Cash Flow Global será uma conta bancária?",
              "Não. A proposta inicial é ser um sistema de organização e inteligência financeira pessoal, sem custodiar dinheiro.",
            ],
            [
              "Posso usar sem conectar meu banco?",
              "Sim. O lançamento manual e a importação fazem parte da visão. Conexões bancárias serão avaliadas por país e parceiro.",
            ],
            [
              "Bitcoin fica misturado com saldo disponível?",
              "Não. Criptoativos aparecem no patrimônio, mas separados de caixa e contas correntes.",
            ],
            [
              "Quais moedas estarão disponíveis?",
              "O foco inicial inclui BRL, USD, EUR, UYU, CLP e BTC, com arquitetura preparada para ampliar a cobertura.",
            ],
          ].map((f, i) => (
            <button
              className={"faq-item " + (openFaq === i ? "open" : "")}
              key={f[0]}
              onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
            >
              <span>
                <b>{f[0]}</b>
                <i>+</i>
              </span>
              <p>{f[1]}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="cta" id="acesso">
        <div className="shell">
          <Mark />
          <h2>
            Seu dinheiro já é global.
            <br />
            Agora seu controle também será.
          </h2>
          <p>
            Entre na lista para acompanhar o desenvolvimento e participar dos
            primeiros testes.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const response = await fetch("/api/v1/auth/early-access", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(Object.fromEntries(new FormData(form))),
              });
              if (response.ok)
                form.innerHTML =
                  "<small>Cadastro criado. Confira seu e-mail para confirmar o acesso.</small>";
            }}
          >
            <input
              name="name"
              type="text"
              placeholder="Seu nome"
              aria-label="Seu nome"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="seu@email.com"
              aria-label="Seu e-mail"
              required
            />
            <button className="button">
              Quero participar <span>→</span>
            </button>
          </form>
          <small>Produto em fase de descoberta. Sem spam.</small>
        </div>
      </section>
      <footer className="shell">
        <a className="brand" href="#top">
          <Mark />
          <span>Cash Flow</span>
          <b>Global</b>
        </a>
        <p>
          Uma nova forma de entender seu dinheiro no mundo.
          <br />
          Produto Apgees · Três Corações + Montevidéu
        </p>
        <div>
          <a href="#">Privacidade</a>
          <a href="#">Termos</a>
          <a href="https://www.apgees.com.br">Apgees</a>
        </div>
      </footer>
    </main>
  );
}
