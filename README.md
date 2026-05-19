# logsnap

A lightweight log tailing and filtering tool with regex highlighting and export support for local development.

---

## Installation

```bash
npm install -g logsnap
```

Or as a dev dependency:

```bash
npm install --save-dev logsnap
```

---

## Usage

Tail a log file with live output:

```bash
logsnap tail app.log
```

Filter output using a regex pattern:

```bash
logsnap tail app.log --filter "ERROR|WARN"
```

Highlight matches in color:

```bash
logsnap tail app.log --highlight "userId=\d+"
```

Export filtered output to a file:

```bash
logsnap tail app.log --filter "ERROR" --export errors.log
```

### Programmatic Usage

```typescript
import { tail } from 'logsnap';

tail('app.log', {
  filter: /ERROR|WARN/,
  highlight: /userId=\d+/,
  onLine: (line) => console.log(line),
});
```

---

## Options

| Flag | Description |
|------|-------------|
| `--filter <regex>` | Only show lines matching the pattern |
| `--highlight <regex>` | Highlight matching text in output |
| `--export <file>` | Write filtered output to a file |
| `--lines <n>` | Number of historical lines to show on start |

---

## License

MIT © logsnap contributors