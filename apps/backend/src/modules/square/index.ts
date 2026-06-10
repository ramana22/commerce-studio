import { ModuleProvider, Modules } from '@medusajs/framework/utils'
import SquareProviderService from './service'

export default ModuleProvider(Modules.PAYMENT, {
  services: [SquareProviderService],
})
