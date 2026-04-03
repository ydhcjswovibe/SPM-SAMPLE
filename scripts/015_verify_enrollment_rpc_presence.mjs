import { probeEnrollmentStatusRpc } from './lib/remote-canonical-sync.mjs'

async function main() {
  const result = await probeEnrollmentStatusRpc()
  console.log(JSON.stringify(result, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
