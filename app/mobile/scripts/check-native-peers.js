const ROOTS = [`${import.meta.dir}/..`, `${import.meta.dir}/../../..`]
const PEERS = ['react-native', 'react-native-worklets']

const readPackage = async (name) => {
  for (const root of ROOTS) {
    const file = Bun.file(`${root}/node_modules/${name}/package.json`)
    if (await file.exists()) return file.json()
  }
  throw new Error(`${name} is not installed`)
}

const { peerDependencies } = await readPackage('react-native-reanimated')

const failures = []
for (const name of PEERS) {
  const range = peerDependencies?.[name]
  if (!range) throw new Error(`react-native-reanimated declares no peer range for ${name}`)

  const { version } = await readPackage(name)
  if (!Bun.semver.satisfies(version, range)) {
    failures.push(`${name}@${version} does not satisfy react-native-reanimated peer range "${range}"`)
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`react-native-reanimated peer ranges satisfied by ${PEERS.join(', ')}`)
