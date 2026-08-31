export const STACK_CATALOG = [
  {
    id: "javascript-typescript",
    label: "JavaScript / TypeScript",
    reference: "references/stacks/javascript-typescript.md",
    sourceExtensions: [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".mts", ".cts"]
  },
  {
    id: "python",
    label: "Python",
    reference: "references/stacks/python.md",
    sourceExtensions: [".py", ".pyi"]
  },
  {
    id: "go",
    label: "Go",
    reference: "references/stacks/go.md",
    sourceExtensions: [".go"]
  },
  {
    id: "rust",
    label: "Rust",
    reference: "references/stacks/rust.md",
    sourceExtensions: [".rs"]
  },
  {
    id: "java-kotlin",
    label: "Java / Kotlin",
    reference: "references/stacks/java-kotlin.md",
    sourceExtensions: [".java", ".kt", ".kts"]
  },
  {
    id: "dotnet",
    label: ".NET",
    reference: "references/stacks/dotnet.md",
    sourceExtensions: [".cs", ".fs", ".vb"]
  },
  {
    id: "php",
    label: "PHP",
    reference: "references/stacks/php.md",
    sourceExtensions: [".php"]
  },
  {
    id: "ruby",
    label: "Ruby",
    reference: "references/stacks/ruby.md",
    sourceExtensions: [".rb", ".rake"]
  },
  {
    id: "native",
    label: "Native C / C++",
    reference: "references/stacks/native.md",
    sourceExtensions: [".c", ".cc", ".cpp", ".cxx", ".h", ".hh", ".hpp", ".hxx"]
  },
  {
    id: "infrastructure",
    label: "Infrastructure / CI",
    reference: "references/stacks/infrastructure.md",
    sourceExtensions: [".tf", ".hcl"]
  },
  {
    id: "aws",
    label: "AWS",
    reference: "references/stacks/aws.md",
    sourceExtensions: []
  },
  {
    id: "ai-llm",
    label: "AI / LLM",
    reference: "references/stacks/ai-llm.md",
    sourceExtensions: []
  }
];

export const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".hg",
  ".svn",
  ".agents",
  ".claude",
  ".codex",
  ".cursor",
  ".gemini",
  ".security-audit",
  ".security-skill-compiler",
  ".venv",
  ".yarn",
  "__pycache__",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "target",
  "vendor"
]);

export const FRAMEWORK_TOKENS = {
  "javascript-typescript": [
    ["next", "Next.js"],
    ["express", "Express"],
    ["@nestjs/core", "NestJS"],
    ["fastify", "Fastify"],
    ["koa", "Koa"],
    ["hono", "Hono"],
    ["nuxt", "Nuxt"],
    ["react", "React"],
    ["vue", "Vue"],
    ["@angular/core", "Angular"],
    ["svelte", "Svelte"],
    ["electron", "Electron"],
    ["graphql", "GraphQL"]
  ],
  python: [
    ["django", "Django"],
    ["flask", "Flask"],
    ["fastapi", "FastAPI"],
    ["starlette", "Starlette"],
    ["tornado", "Tornado"],
    ["sqlalchemy", "SQLAlchemy"],
    ["celery", "Celery"],
    ["pydantic", "Pydantic"]
  ],
  go: [
    ["github.com/gin-gonic/gin", "Gin"],
    ["github.com/labstack/echo", "Echo"],
    ["github.com/gofiber/fiber", "Fiber"],
    ["github.com/go-chi/chi", "Chi"],
    ["google.golang.org/grpc", "gRPC"],
    ["github.com/gorilla/websocket", "WebSocket"]
  ],
  rust: [
    ["actix-web", "Actix Web"],
    ["axum", "Axum"],
    ["rocket", "Rocket"],
    ["warp", "Warp"],
    ["tonic", "Tonic gRPC"],
    ["sqlx", "SQLx"],
    ["diesel", "Diesel"]
  ],
  "java-kotlin": [
    ["spring-security", "Spring Security"],
    ["spring-boot", "Spring Boot"],
    ["quarkus", "Quarkus"],
    ["micronaut", "Micronaut"],
    ["ktor", "Ktor"],
    ["hibernate", "Hibernate"],
    ["jakarta.ws.rs", "Jakarta REST"]
  ],
  dotnet: [
    ["microsoft.aspnetcore", "ASP.NET Core"],
    ["microsoft.entityframeworkcore", "Entity Framework Core"],
    ["microsoft.identity", "Microsoft Identity"],
    ["graphql", "GraphQL"]
  ],
  php: [
    ["laravel/framework", "Laravel"],
    ["symfony/framework-bundle", "Symfony"],
    ["slim/slim", "Slim"],
    ["cakephp/cakephp", "CakePHP"],
    ["doctrine/orm", "Doctrine ORM"]
  ],
  ruby: [
    ["rails", "Rails"],
    ["sinatra", "Sinatra"],
    ["grape", "Grape"],
    ["hanami", "Hanami"],
    ["sidekiq", "Sidekiq"]
  ],
  infrastructure: [
    ["terraform", "Terraform"],
    ["pulumi", "Pulumi"],
    ["kubernetes", "Kubernetes"],
    ["helm", "Helm"],
    ["docker", "Docker"],
    ["github-actions", "GitHub Actions"]
  ],
  aws: [
    ["@aws-cdk/", "AWS CDK"],
    ["aws-cdk-lib", "AWS CDK"],
    ["@aws-sdk/", "AWS SDK"],
    ["boto3", "AWS SDK"],
    ["botocore", "AWS SDK"],
    ["github.com/aws/aws-sdk-go", "AWS SDK"],
    ["software.amazon.awssdk", "AWS SDK"],
    ["AWSSDK.", "AWS SDK"]
  ],
  "ai-llm": [
    ["openai", "OpenAI SDK"],
    ["anthropic", "Anthropic SDK"],
    ["langchain", "LangChain"],
    ["llamaindex", "LlamaIndex"],
    ["llama-index", "LlamaIndex"],
    ["semantic-kernel", "Semantic Kernel"],
    ["autogen", "AutoGen"],
    ["@modelcontextprotocol/sdk", "Model Context Protocol"],
    ["mcp", "Model Context Protocol"]
  ]
};
