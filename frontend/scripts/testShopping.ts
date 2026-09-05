import { runShoppingSearchTests } from '../src/services/__tests__/shoppingSearchService.test';

const { passed, failed } = runShoppingSearchTests();

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED SUCCESSFULLY! 🚀');
  process.exit(0);
}
