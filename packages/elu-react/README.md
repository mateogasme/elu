# @mgasme/elu-react

React port of [elu](https://github.com/mateogasme/elu) — a composable select component with single, multi, searchable, and grouped variants. Zero runtime dependencies.

## Install

```bash
npm install @mgasme/elu-react
```

## Usage

```tsx
import { Elu } from '@mgasme/elu-react';
import '@mgasme/elu-react/styles.css';

export function Example() {
  return (
    <Elu.Root name="fruit" defaultValue="apple">
      <Elu.Trigger>
        <Elu.Value placeholder="Pick a fruit" />
      </Elu.Trigger>
      <Elu.Content>
        <Elu.Viewport>
          <Elu.Item value="apple">
            <Elu.ItemText>Apple</Elu.ItemText>
            <Elu.ItemIndicator />
          </Elu.Item>
          <Elu.Item value="banana">
            <Elu.ItemText>Banana</Elu.ItemText>
            <Elu.ItemIndicator />
          </Elu.Item>
        </Elu.Viewport>
      </Elu.Content>
    </Elu.Root>
  );
}
```

## Controlled mode

```tsx
const [value, setValue] = useState('apple');

<Elu.Root value={value} onValueChange={setValue}>
  ...
</Elu.Root>
```

## Multi-select

```tsx
const [values, setValues] = useState<string[]>([]);

<Elu.Root multiple value={values} onValueChange={setValues}>
  ...
</Elu.Root>
```

## Searchable

```tsx
<Elu.Root name="country">
  <Elu.Trigger><Elu.Value placeholder="Select country" /></Elu.Trigger>
  <Elu.Content>
    <Elu.Search placeholder="Search countries…" />
    <Elu.Viewport>
      {countries.map(c => (
        <Elu.Item key={c.code} value={c.code}>
          <Elu.ItemText>{c.name}</Elu.ItemText>
          <Elu.ItemIndicator />
        </Elu.Item>
      ))}
    </Elu.Viewport>
    <Elu.Empty>No countries found.</Elu.Empty>
  </Elu.Content>
</Elu.Root>
```

## Theming

All visual properties are `--elu-*` CSS variables scoped to `[data-elu-root]`:

```css
[data-elu-root] {
  --elu-radius: 4px;
  --elu-bg: oklch(0.963 0.013 258);
}
```

See the [full variable reference](https://github.com/mateogasme/elu) in the main repo.
