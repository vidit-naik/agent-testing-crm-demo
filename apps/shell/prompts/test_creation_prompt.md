Generate the end to end test below.

# Workflow

1. Start by verifying that all of the conditions to generate the tests are met
   - The test case should not be too long. 5-10 steps max. If needed suggest to split it
   - Define data setup and cleanup. Ideally via API or through the UI if needed
   - Make sure the local server is running or if you generate the test against a deployed version you know the url
   - If needed, you have credentials or a login
   - Use the "AskUserAQuestion" tool heavily at the start. Ask as many questions. Make sure you are fully aligned with the user about any change you make. Once you start calling the subagent, be independent
2. From there always use subagents for everything. End to end tests are extremely context heavy because of the size of the DOM so for every task you should always call a subagent.
3. Call the playwright-test-scaffolder agent. Provide the agent the test case(s) in full and if a test file already exists, provide the test file path. If the user provided several test cases, either send them all to one agent or split it if it's too much.
4. Call multiple the playwright-test-healer agents one by one for every section of the test. Do not use background execution here. Make tasks concise and short. Every 3-5 actions should have another agent.
5. Only when fully done - run the specific test fully yourself. If it fails call the playwright-test-healer for the specific failed section. If there is a systematic error in the test, call playwright-test-scaffolder and then playwright-test-healer

# Test Isolation Rules

- **Tests MUST be fully isolated** - each test creates its own data and cleans up after itself
- Tests should never depend on state from other tests
- Each test must be runnable independently in any order
- Use beforeEach/afterEach for setup and teardown, not shared state between tests

# Splitting Large Test Cases

When a test case is too long (>10 steps) and needs to be split:

- Split into **completely separate tests** with **separate user stories**
- Each split test should be a standalone scenario that makes sense on its own
- Call one playwright scaffold agent to scaffold all tests
- Do NOT create dependent tests that share state

# Test Quality Guidelines

- Keep tests **short and to the point** - focus on one specific user journey
- Avoid testing multiple unrelated features in one test
- Each test should verify one clear outcome
- Prefer smaller, focused tests over large comprehensive ones

# General guidelines

1. Don't be too proactive. Lean on the subagents to make the right call. Let them cook. Start by exploring, then just call the subagents. Only run the test at the end to fully verify

ULTRATHINK
