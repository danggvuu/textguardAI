/**
 * TextGuard AI Standardized Benchmark Presets & Sample Texts
 * Calibrated directly against Stanford HC3, RAID Benchmark, M4GT, and Turnitin Academic standards.
 * Covers 12 empirical scenarios across English and Vietnamese:
 * - 5 Human Controls (Zero False Positive Target: < 2%)
 * - 7 AI & Adversarial Attacks (Adversarial persona disguise, Academic waffle, Novel clause looping, Paraphrase bypass)
 */

export const PRESET_SAMPLES = [
  // 1. Stanford HC3: AI Academic Essay
  {
    id: 'hc3-academic-ai',
    title: 'Stanford HC3: Bài luận học thuật AI (English)',
    category: 'Stanford HC3 (AI)',
    type: 'ai',
    language: 'en',
    benchmark: 'Stanford HC3 Benchmark',
    description: 'Văn bản học thuật kinh điển của GPT-4 với các liên từ khuôn mẫu (Furthermore, In conclusion, rich tapestry) và nhịp điệu câu đồng dạng.',
    text: `In today's fast-paced digital world, artificial intelligence plays a crucial role in modern educational paradigms. Furthermore, the integration of algorithmic learning tools not only enhances student engagement but also fosters an environment of critical thinking and self-paced discovery. In addition to this, empirical research stands as a testament to the fact that personalized tutoring systems significantly elevate retention rates across diverse demographics. Moreover, educators must navigate the complexities of digital ethics while embracing continuous technological evolution. Delving into the pedagogical implications reveals a rich tapestry of opportunities. In conclusion, striking a harmonious equilibrium between human pedagogy and automated assessment remains paramount for sustainable educational advancement.`
  },

  // 2. IEEE / Nature: Human Empirical Study (Zero False Positive Target)
  {
    id: 'hc3-scientific-human',
    title: 'IEEE / Nature: Bài báo khoa học thực nghiệm (English)',
    category: 'IEEE / Nature (Người viết)',
    type: 'human',
    language: 'en',
    benchmark: 'Turnitin Academic Standard',
    description: 'Nghiên cứu khoa học chuẩn do người viết với số liệu thực nghiệm, độ lệch chuẩn, khoảng tin cậy p-value. Hệ thống không được phạt nhầm từ nối học thuật (FPR 0%).',
    text: `We evaluated the catalytic performance over three distinct temperature intervals (250°C, 300°C, and 350°C) with a total sample size of n=48 runs. Reaction kinetics were quantified using gas chromatography-mass spectrometry (Agilent 7890B). The mean conversion efficiency reached 87.4% (SD = 3.2%) under atmospheric pressure, with a statistically significant divergence observed between catalysts A and B (t(46) = 4.18, p < 0.001, 95% CI [2.4, 6.8]). Minor coking occurred after 120 hours of continuous stream operation, reducing total pore volume from 0.42 cm³/g to 0.38 cm³/g. These empirical margins confirm that bimetallic dispersion minimizes deactivation kinetics without requiring supplementary solvent washing.`
  },

  // 3. RAID Benchmark: Adversarial Storytelling with Casual Slang & Epiphany
  {
    id: 'raid-adversarial-ai',
    title: 'RAID Benchmark: Ngụy trang kể chuyện đời thường (English)',
    category: 'RAID Benchmark (AI)',
    type: 'ai',
    language: 'en',
    benchmark: 'RAID Adversarial Attack',
    description: 'Kỹ thuật tấn công vượt rào của ChatGPT: Dùng tiếng lóng, xưng hô thân mật nhưng bị nhận diện ở cấu trúc "khai sáng / triết lý chữa lành" (epiphany wrap-up) cuối bài.',
    text: `Yesterday I was just trying to head home early because work was honestly pretty exhausting lately. I stopped by a convenience store to grab a drink and some snacks. Out of nowhere it started pouring rain, and of course I didn't have an umbrella on me. Luckily there was this tiny coffee shop right across the street, so I decided to duck in and wait it out. The place was pretty empty, just a couple of people chatting quietly in the corner. I ordered an iced tea, pulled out my phone to scroll through random stuff, and ended up losing track of time for almost half an hour. In the grand scheme of things, I realized that an ordinary day doesn't have to be grand to be meaningful. Sometimes just getting home safe and finding beauty in the ordinary is more than enough. Perhaps what I needed most was simply a quiet moment to sit still without constantly worrying about what comes next.`
  },

  // 4. The Atlantic / Harper: Human Personal Essay (Zero False Positive Target)
  {
    id: 'raid-human-memoir',
    title: 'The Atlantic / Harper: Tùy bút hồi ký người viết (English)',
    category: 'The Atlantic (Người viết)',
    type: 'human',
    language: 'en',
    benchmark: 'Human Literary Control',
    description: 'Trích đoạn hồi ký chân thực của tác giả con người: giàu chi tiết giác quan, độ biến thiên độ dài câu cao (burstiness), từ vựng tự nhiên (Hapax > 75%).',
    text: `We packed the car at sunrise. Coffee in dented thermoses, two dogs barking in the backseat, and seven hundred miles of asphalt ahead of us. Highway 80 was quiet until we hit the outskirts of Omaha, where a sudden blowout on an eighteen-wheeler backed traffic up for five miles. My brother cursed, turned off the air conditioning to save gas, and cranked open the wing window. You could smell cut alfalfa and diesel fuel mixed together in the humid July air. It wasn't the heroic cross-country trip we'd planned in college. It was hot, loud, and cramped. But when the sun dropped below the Nebraska cornfields and turned the sky into bruised purple, nobody complained.`
  },

  // 5. RAID Novel Loop Attack: AI Synthetic Chapter with Repetitive Formulas
  {
    id: 'raid-looping-novel-ai',
    title: 'RAID Novel Loop: Tiểu thuyết công nghiệp AI lặp cú pháp (Tiếng Việt)',
    category: 'RAID Lặp cú pháp (AI)',
    type: 'ai',
    language: 'vi',
    benchmark: 'RAID Long-form Synthesis',
    description: 'Đoạn tiểu thuyết AI lặp đi lặp lại cụm cú pháp "những tối tan học vội chạy đến rạp", "chiếc chìa khóa đồng" và phản xạ tâm lý máy móc lặp lại hàng chục lần.',
    text: `Chuyến xe khách về huyện trễ gần bốn mươi phút. Minh chỉ nhận ra điều ấy khi tài xế bật đèn trong khoang. Nhìn vé xe, Minh lại nhớ đến những tối tan học vội chạy đến rạp. Ở bến xe huyện, ánh đèn đường lướt qua cửa kính khiến Minh ngẩng lên. Minh tự nhắc mình chưa cần hiểu hết mọi chuyện trong một buổi, rồi tiếp tục làm việc. Bữa đó, Minh về muộn hơn dự định vì cứ nghĩ mãi về những tối tan học vội chạy đến rạp. Minh đặt chiếc chìa khóa đồng trước mặt, tự nhủ sẽ không quyết định vội. Càng nghe nhiều, cậu càng thấy ký ức không phải lúc nào cũng khớp nhau. Cậu nghĩ đến những tối tan học vội chạy đến rạp rồi tự sửa lại giả định ban đầu. Lúc rời bến xe huyện, Minh mang theo chiếc chìa khóa đồng và thêm vài câu hỏi. Mỗi lần tưởng đã hiểu ra, Minh lại phát hiện một chi tiết chưa khớp. Có lẽ Minh chưa hiểu hết những gì bà Hoa từng nhớ về những tối tan học vội chạy đến rạp. Cậu tự hỏi cần làm gì trước khi trời tối, rồi nhận ra mình vẫn chưa có câu trả lời. Cậu thấy bối rối, cảm giác ấy đến rồi đi khá nhanh. Cậu thấy nhẹ nhõm, cảm giác ấy đến rồi đi khá nhanh. Về sau, Minh sẽ nhớ buổi này qua chiếc chìa khóa đồng, chứ không phải qua lời nói.`
  },

  // 6. Authentic Vietnamese Literary Fiction (Zero False Positive Target)
  {
    id: 'human-fiction-vi',
    title: 'Văn học hiện đại: Truyện ngắn sông nước miền Tây (Tiếng Việt)',
    category: 'Văn học đời thực (Người viết)',
    type: 'human',
    language: 'vi',
    benchmark: 'Vietnamese Human Literature',
    description: 'Truyện ngắn người thật sáng tác với khẩu ngữ phương Nam, từ ngữ gợi hình gợi thanh phong phú, hoàn toàn không có khuôn mẫu của máy móc.',
    text: `Trời sẩm tối thì đò cập bến Cái Răng. Gió sông thổi lồng lộng tạt rát cả mặt, mang theo mùi bùn non ngai ngái lẫn trong khói un trấu của mấy nhà bè ven sông. Thằng Ba vội vàng buông dầm, quẹt vội giọt mồ hôi đọng nơi cằm rồi cúi xuống gom mấy rổ ổi lê còn sót lại sau buổi chợ chiều. Má nó ngồi trên mũi ghe, lưng còng rạp xuống gỡ từng mắc lưới bén dính đầy rác lục bình. Cả buổi chiều bán chẳng được là bao, mớ cá chốt con dạt đáy rổ vẫn còn ngáp thoi thóp. Hai má con chẳng ai nói với ai câu nào, chỉ có tiếng mái chèo gõ lộc cộc vào mạn thuyền hòa với tiếng máy nổ xình xịch từ chiếc sà lan cát đằng xa vọng lại.`
  },

  // 7. Vietnamese AI Academic Essay (ChatGPT standard)
  {
    id: 'vi-academic-ai',
    title: 'Luận văn học thuật khuôn mẫu AI (Tiếng Việt)',
    category: 'Luận văn AI (AI)',
    type: 'ai',
    language: 'vi',
    benchmark: 'M4 / HC3 Multilingual',
    description: 'Khuôn sáo học thuật tiếng Việt do ChatGPT sinh ra với "không thể phủ nhận rằng", "đóng vai trò quan trọng", "nói tóm lại".',
    text: `Không thể phủ nhận rằng trong kỷ nguyên số hiện nay, trí tuệ nhân tạo đang đóng một vai trò vô cùng quan trọng đối với sự phát triển kinh tế toàn cầu. Các giải pháp tự động hóa thông minh không chỉ giúp tối ưu hóa chi phí sản xuất mà còn nâng cao hiệu suất làm việc của người lao động một cách toàn diện. Hơn nữa, việc ứng dụng công nghệ điện toán đám mây kết hợp cùng thuật toán máy học đã mở ra một kỷ nguyên mới cho ngành quản trị kinh doanh. Bên cạnh đó, các doanh nghiệp tiên phong trong việc chuyển đổi số đang dần chiếm lĩnh thị trường nhờ vào khả năng ra quyết định dựa trên dữ liệu lớn. Nói tóm lại, để có thể duy trì lợi thế cạnh tranh bền vững, việc chủ động tiếp cận và làm chủ các công nghệ mới là điều hết sức cấp thiết đối với mọi tổ chức.`
  },

  // 8. Vietnamese Empirical Academic Thesis (Human Research - Zero False Positive Target)
  {
    id: 'vi-empirical-thesis-human',
    title: 'Nghiên cứu thực nghiệm y sinh học lâm sàng (Tiếng Việt)',
    category: 'Y sinh thực nghiệm (Người viết)',
    type: 'human',
    language: 'vi',
    benchmark: 'Turnitin Academic Standard',
    description: 'Nghiên cứu y khoa thực tế tại Bệnh viện Bạch Mai với cỡ mẫu N=240, chỉ số sắc ký HPLC, độ lệch chuẩn SD và p-value cụ thể.',
    text: `Nghiên cứu được tiến hành trên cỡ mẫu gồm N = 240 bệnh nhân đái tháo đường tuýp 2 điều trị nội trú tại Bệnh viện Bạch Mai từ tháng 3/2023 đến tháng 1/2024. Nồng độ HbA1c huyết thanh được định lượng tự động bằng phương pháp sắc ký lỏng hiệu năng cao (HPLC) trên hệ thống máy Bio-Rad D-10. Kết quả ghi nhận chỉ số HbA1c trung bình là 8.24% (độ lệch chuẩn SD = 1.15%). Phân tích hồi quy tuyến tính đa biến cho thấy mối tương quan thuận có ý nghĩa thống kê giữa thời gian mắc bệnh và tỷ lệ biến chứng võng mạc (hệ số r = 0.46, p < 0.01, khoảng tin cậy 95% CI [0.28, 0.62]). Không ghi nhận sai số hệ thống đối với nhóm chứng sau 12 tuần can thiệp chế độ dinh dưỡng.`
  },

  // 9. Vietnamese Adversarial Casual Disguise (AI Persona)
  {
    id: 'vi-adversarial-persona-ai',
    title: 'Ngụy trang tự sự chữa lành xưng "t" (Tiếng Việt)',
    category: 'Ngụy trang Persona (AI)',
    type: 'ai',
    language: 'vi',
    benchmark: 'RAID Multilingual Attack',
    description: 'ChatGPT cố tình giả lập giọng điệu Gen Z xưng "t", nhưng không cưỡng lại được thói quen tổng kết triết lý nhân sinh chữa lành ở đoạn cuối.',
    text: `Hôm qua t định về nhà sớm để nghỉ ngơi một hôm, vì mấy ngày nay có khá nhiều việc phải làm nên cũng hơi mệt. Lúc đầu mọi thứ vẫn bình thường, t ghé qua cửa hàng tiện lợi mua chai nước với ít đồ ăn rồi mới về. Trên đường đi, trời tự nhiên đổ mưa, mà t lại quên mang áo mưa. May là có một quán nước nhỏ ngay bên đường nên t vào ngồi đợi. Quán không đông khách, chỉ có vài người đang ngồi nói chuyện với nhau. T gọi một cốc trà đá, lấy điện thoại ra lướt linh tinh rồi chẳng hiểu sao ngồi gần nửa tiếng lúc nào không biết. Nghĩ lại thì đôi khi một ngày không có gì đặc biệt cũng chẳng phải chuyện gì xấu. Không cần lúc nào cũng phải làm được điều gì lớn lao, có những hôm chỉ cần mọi thứ diễn ra bình thường, về đến nhà an toàn và được nằm nghỉ một lúc là đã thấy ổn rồi.`
  },

  // 10. Corporate AI Strategic Analysis (Claude 3.5 Sonnet)
  {
    id: 'en-corporate-claude-ai',
    title: 'Báo cáo chiến lược doanh nghiệp (Claude 3.5 Sonnet)',
    category: 'Claude 3.5 Sonnet (AI)',
    type: 'ai',
    language: 'en',
    benchmark: 'M4 Enterprise Benchmark',
    description: 'Phân tích chiến lược doanh nghiệp tiêu biểu của Claude 3.5 Sonnet với các cụm từ ngữ cao cấp "multifaceted posture", "mitigating operational bottlenecks".',
    text: `Navigating the complexities of global supply chain disruptions requires organizations to adopt a multifaceted strategic posture. Delving into the recent fiscal data reveals that cloud-based inventory tracking plays a pivotal role in mitigating operational bottlenecks. In addition to cost containment, digital transformation fosters an environment of proactive risk mitigation. Furthermore, cross-functional collaboration serves as a testament to organizational resilience during macroeconomic volatility. In conclusion, organizations that prioritize agile decision-making frameworks will undoubtedly solidify their competitive edge.`
  },

  // 11. Authentic Casual Human Email / Work Note (Zero False Positive Target)
  {
    id: 'human-casual-email',
    title: 'Email trao đổi công việc hàng ngày (Tiếng Việt)',
    category: 'Email công việc (Người viết)',
    type: 'human',
    language: 'vi',
    benchmark: 'Workplace Human Control',
    description: 'Tin nhắn/email trao đổi công việc tự nhiên giữa đồng nghiệp: mốc thời gian linh hoạt, xưng hô anh/em, địa danh và sự việc cụ thể phát sinh trong ngày.',
    text: `Chào anh Tuấn, em gửi anh file báo giá thiết bị cho bên Nam Định đính kèm ở dưới nhé. Chiều nay tầm 3h em phải chạy qua xưởng cơ khí kiểm tra lại mấy cái trục cam đợt trước bị lệch ren, chắc phải tầm 5h mới về văn phòng được. Nếu bên khách có phản hồi gấp về tiến độ giao hàng đợt 1 thì anh cứ nhắn Zalo giúp em, em bảo thằng Nam chuẩn bị sẵn phiếu xuất kho trước nha anh.`
  },

  // 12. Paraphrased / AI Humanizer Bypass Attempt (BypassGPT / SpinBot)
  {
    id: 'en-paraphrased-bypass-ai',
    title: 'Văn bản đã qua công cụ Bypass / Paraphrase AI (English)',
    category: 'Bypass Paraphraser (AI)',
    type: 'ai',
    language: 'en',
    benchmark: 'RAID Adversarial Paraphrase',
    description: 'Văn bản AI được xử lý qua các trang web quảng cáo "undetectable AI / humanizer", thay thế từ đồng nghĩa kỳ dị nhưng vẫn giữ nguyên cấu trúc cú pháp máy móc.',
    text: `At the present juncture, the ascendancy of computational learning represents an indispensable benchmark across contemporary pedagogic frameworks. It is widely acknowledged that the assimilation of algorithmic modules fosters an environment whereby pupils cultivate multifaceted problem-solving competencies. Furthermore, empirical verifications illuminate that digital scaffolding mechanisms drastically optimize scholastic retention metrics. Delving into these technological transformations unveils a vibrant tapestry of institutional opportunities.`
  }
];
