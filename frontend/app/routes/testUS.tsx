import { UserProvider, useUserStore } from '@/stores/UserStore';
import { Modal } from '@/components/Modal';

export default function TestUSPage() {
  const { modal, user, isLoggedIn } = useUserStore();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test UserStore & Modal</h1>
      <hr />
      <button onClick={() => modal.open("test-modal")}>
        Otwórz testowy modal
      </button>

      {/* Komponent modalu */}
      <Modal name="test-modal">
        <h2>To jest Modal!</h2>
        <p>Został wywołany globalnie z UserStore.</p>
      </Modal>
    </div>
  );
}