const ROOT = `${import.meta.dir}/../../..`

const readPackage = async (name) => {
  const file = Bun.file(`${ROOT}/node_modules/${name}/package.json`)
  return (await file.exists()) ? file.json() : null
}

const { dependencies } = await Bun.file(`${import.meta.dir}/../package.json`).json()

const installed = new Map()
for (const name of Object.keys(dependencies)) {
  const pkg = await readPackage(name)
  if (pkg) installed.set(name, pkg)
}

const failures = []
for (const [name, pkg] of installed) {
  const meta = pkg.peerDependenciesMeta ?? {}
  for (const [peer, range] of Object.entries(pkg.peerDependencies ?? {})) {
    const dependency = installed.get(peer)
    if (!dependency || meta[peer]?.optional) continue

    if (!Bun.semver.satisfies(dependency.version, range)) {
      failures.push(
        `${name}@${pkg.version} requires ${peer} "${range}" but ${dependency.version} is installed`
      )
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`peer ranges satisfied across ${installed.size} mobile dependencies`)
