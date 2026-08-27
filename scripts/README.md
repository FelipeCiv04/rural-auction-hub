# Seed do catálogo

O seed carrega `src/data/mock-auctions.ts` e `src/data/mock-lots.ts` usando o pipeline do Vite, para que os mocks continuem sendo a fonte dos dados. Ele grava 5 `auctions`, 6 `lots`, 24 `lot_specs` e 7 `bid_history`.

Execute somente quando a carga for aprovada:

```powershell
npm run seed
```

O processo exige `VITE_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no ambiente local ou em `.env.local`. A chave de serviço é usada apenas pelo processo local, não é importada pelo frontend e não deve ser versionada. Ela é necessária porque as policies RLS de escrita exigem admin; o seed não implementa autenticação.

Os IDs são UUIDs determinísticos derivados de SHA-256 com namespace e identificador do mock. Leilões existentes são encontrados por `code`; lotes, por `auction_id + number`. Os registros de `lot_specs` e `bid_history` são recriados por lote usando IDs determinísticos, evitando duplicação e refletindo remoções ou alterações nos mocks.

`starts_at` é derivado de `date` e `time` dos mocks com o fuso `America/Sao_Paulo` (`-03:00`). Para os textos relativos de `bidHistory.at`, o seed usa o `starts_at` do leilão como referência estável e subtrai os minutos indicados. Isso fornece o timestamp exigido pelo schema sem criar uma data de evento independente.

Os imports locais de imagem do Vite são mapeados para as URLs públicas permanentes correspondentes no bucket `auction-images`, usando o domínio de `VITE_SUPABASE_URL` e o caminho `/storage/v1/object/public/auction-images/<arquivo>`. O seed não faz upload nem configura Storage; os cinco arquivos já precisam existir no bucket.
