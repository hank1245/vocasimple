import Constants from "expo-constants";

export interface AIExampleResult {
  success: boolean;
  example?: string;
  error?: string;
}

export const aiExampleService = {
  async generateExample(
    word: string,
    meaning: string
  ): Promise<AIExampleResult> {
    try {
      // Access environment variables through Expo Constants
      const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_CLAUDE_API_KEY;

      if (!apiKey || apiKey === "YOUR_CLAUDE_API_KEY_HERE") {
        return {
          success: false,
          error:
            "Claude API 키가 설정되지 않았습니다. .env 파일에서 EXPO_PUBLIC_CLAUDE_API_KEY를 설정해주세요.",
        };
      }

      const apiUrl =
        Constants.expoConfig?.extra?.EXPO_PUBLIC_CLAUDE_API_URL ||
        "https://api.anthropic.com/v1/messages";

      const prompt = `주어진 영어 단어와 한국어 뜻을 사용하여 실용적이고 자연스러운 영어 예문을 하나만 생성해주세요.

단어: ${word}
뜻: ${meaning}

요구사항:
1. 일상생활에서 자주 사용되는 자연스러운 문장
2. 단어의 의미를 명확하게 보여주는 문맥
3. 너무 복잡하지 않고 이해하기 쉬운 문장
4. 예문만 응답하고 다른 설명은 포함하지 마세요

예문:`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 150,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Claude API Error:", errorData);

        if (response.status === 401) {
          return {
            success: false,
            error:
              "Claude API 키가 유효하지 않습니다. .env 파일의 API 키를 확인해주세요.",
          };
        } else if (response.status === 429) {
          return {
            success: false,
            error: "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
          };
        } else {
          return {
            success: false,
            error:
              "Claude API 요청에 실패했습니다. 네트워크 연결을 확인해주세요.",
          };
        }
      }

      const data = await response.json();

      if (data.content && data.content.length > 0) {
        const example = data.content[0].text.trim();

        // Remove any extra formatting or explanations
        const cleanExample = example
          .replace(/^예문:\s*/i, "")
          .replace(/^Example:\s*/i, "")
          .replace(/^\d+\.\s*/, "")
          .replace(/^-\s*/, "")
          .trim();

        return {
          success: true,
          example: cleanExample,
        };
      } else {
        return {
          success: false,
          error: "Claude API에서 예문을 생성하지 못했습니다.",
        };
      }
    } catch (error) {
      console.error("AI Example Service Error:", error);
      return {
        success: false,
        error:
          "예문 생성 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.",
      };
    }
  },
};
