import { shortDate } from '@eazybox/shared'
import type { User } from '@eazybox/shared'
import { Badge } from '@/components/ui/badge'
import { Band } from '@/components/ui-x/Band'
import {
  HairlineTable,
  HairlineTd,
  HairlineTh,
  HairlineTr,
} from '@/components/ui-x/HairlineTable'
import { SectionCard } from '@/components/ui-x/SectionCard'
import { roleOf } from '@/lib/theme/tokens'
import { useApi } from '@/lib/use-api'

export function Membros() {
  const { data: users } = useApi<User[]>('/users', [])

  return (
    <Band title="Membros" subtitle="Quem tem acesso ao app do box.">
      <SectionCard title="Cadastro" description={`${users.length} pessoa(s)`}>
        {users.length === 0 ? (
          <p className="text-xs text-ink-2">Nenhum membro cadastrado.</p>
        ) : (
          <HairlineTable columns={['auto', 'auto', '110px', '110px', '120px']}>
            <thead>
              <HairlineTr>
                <HairlineTh>Nome</HairlineTh>
                <HairlineTh>E-mail</HairlineTh>
                <HairlineTh>Papel</HairlineTh>
                <HairlineTh>Situação</HairlineTh>
                <HairlineTh>Desde</HairlineTh>
              </HairlineTr>
            </thead>
            <tbody>
              {users.map((user) => {
                const role = roleOf(user)
                return (
                  <HairlineTr key={user.id}>
                    <HairlineTd className="text-sm">
                      {user.firstName} {user.lastName}
                    </HairlineTd>
                    <HairlineTd className="text-xs text-ink-2">
                      {user.email}
                    </HairlineTd>
                    <HairlineTd>
                      <Badge tone={role.tone}>{role.label}</Badge>
                    </HairlineTd>
                    <HairlineTd>
                      <Badge tone={user.isActive ? 'ok' : 'neutral'} dot>
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </HairlineTd>
                    <HairlineTd className="text-xs text-ink-2">
                      {shortDate(user.createdAt)}
                    </HairlineTd>
                  </HairlineTr>
                )
              })}
            </tbody>
          </HairlineTable>
        )}
      </SectionCard>
    </Band>
  )
}
