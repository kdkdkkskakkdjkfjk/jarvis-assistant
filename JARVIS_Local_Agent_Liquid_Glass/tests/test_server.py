import unittest

import jarvis_server as jarvis


class AgentOutputTests(unittest.TestCase):
    def test_new_session_is_created_before_resume(self):
        old_created, old_session = jarvis.SESSION_CREATED, jarvis.APP_SESSION
        try:
            jarvis.SESSION_CREATED, jarvis.APP_SESSION = False, ""
            first = jarvis.build_opencode_command("opencode", "hello")
            self.assertNotIn("--session", first)
            jarvis.SESSION_CREATED, jarvis.APP_SESSION = True, "ses_from_opencode"
            later = jarvis.build_opencode_command("opencode", "again")
            self.assertEqual(later[later.index("--session") + 1], "ses_from_opencode")
        finally:
            jarvis.SESSION_CREATED, jarvis.APP_SESSION = old_created, old_session

    def test_opencode_text_events(self):
        raw = '\n'.join([
            '{"type":"step_start","sessionID":"ses_test"}',
            '{"type":"text","part":{"type":"text","text":"Hallo "}}',
            '{"type":"text","part":{"type":"text","text":"Jarvis"}}',
        ])
        answer, session = jarvis.parse_opencode_output(raw)
        self.assertEqual(answer, "Hallo Jarvis")
        self.assertEqual(session, "ses_test")

    def test_plain_text_fallback(self):
        self.assertEqual(jarvis.parse_opencode_output("Offline bereit.")[0], "Offline bereit.")

    def test_memory_is_reference_and_bounded(self):
        self.assertIn("vault/VAULT-INDEX.md", jarvis.read_memory_context())
        self.assertLessEqual(len(jarvis.read_memory_context()), 12_000)


if __name__ == "__main__":
    unittest.main()
