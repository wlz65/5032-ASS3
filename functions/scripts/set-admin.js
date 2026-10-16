const { getApps, initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')

if (!getApps().length) initializeApp()

async function main() {
  const email = String(process.argv[2] || '').trim()
  if (!email) {
    console.error('Usage: npm run set-admin -- admin@example.com')
    process.exitCode = 1
    return
  }

  const user = await getAuth().getUserByEmail(email)
  await getAuth().setCustomUserClaims(user.uid, {
    ...user.customClaims,
    admin: true,
  })

  console.log(`Administrator access enabled for ${email}. Sign out and sign in again.`)
}

main().catch((error) => {
  console.error(`Could not enable administrator access: ${error.message}`)
  process.exitCode = 1
})
