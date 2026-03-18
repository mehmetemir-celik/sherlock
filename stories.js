// Sherlock Yes/No - Lateral Thinking Bulmaca Veritabanı
const STORIES = [
  {
    id: "zehirli-buzlar",
    title: "Buzlu Çay",
    scenario: "İki adam bir restoranda buzlu çay içerler. Adamlardan biri çok susadığı için 5 dakika içinde üç bardak buzlu çay içer. Diğer adam ise sadece bir bardak buzlu çayı yavaş yavaş, yarım saatte içer. Yemekten sonra yavaş içen adam zehirlenerek ölür, ancak hızlı içen adam hayatta kalır. Hızlı içen nasıl hayatta kaldı?",
    solution: "Buzlu çaylardaki buz zehirliydi. Hızlı içen adam, buzlar erimeden buzlu çayını bitirdiği için zehirlenmedi. Yavaş içen adamın bardağındaki buzlar ise zamanla eridi ve zehir buzlu çaya karıştı.",
    difficulty: 1,
    hints: [
      "Süre, zehrin içeceğe ne kadar sürede nüfuz ettiği ile ilgilidir."
    ],
    customRules: "- Zehrin çayda değil, buzda olduğunu anlamaları kritik. 'Zehir baştan beri çayda mıydı?' sorusuna HAYIR veya 'Tam olarak değil' gibi dolaylı cevap ver. 'Zehir buzda mıydı?' sorusuna EVET ver."
  },
  {
    id: "adam-ve-asansor",
    title: "Çıkmayan Asansör",
    scenario: "Bir adam, bir binanın 15. katında yaşıyor. Her sabah asansöre biner, zemin kata iner ve işe gider. Akşam döndüğünde ise asansöre biner, 7. kata çıkar ve kalan 8 katı yürüyerek çıkar. Yağmurlu günlerde ise doğrudan 15. kata çıkar. Neden?",
    solution: "Adam çok kısadır. Asansör düğmelerinde sadece 7. kata kadar uzanabilir. Yağmurlu günlerde şemsiyesi olur ve şemsiyesiyle 15. kat düğmesine basabilir.",
    customRules: "- Adamın 'cüce' olduğu veya 'boyunun kısa' olduğu bilgisi asıl sürprizdir. Oyuncu bu kelimeleri bizzat kullanmadıkça (veya 'boy' ile ilgili bir soru sormadıkça) cevaplarında 'boy', 'kısa', 'yetişememek' gibi kelimeleri kullanma.\n- Oyuncu 'şemsiye' kelimesini kullanmadan asla şemsiyeden bahsetme. Şemsiye sorulursa sadece 'Evet, o gün yanında bir eşya vardı' gibi kapalı cevaplar ver.\n- 'Düğmelere basmak' eylemini oyuncu bulana kadar açıklama.",
    difficulty: 2,
    hints: [
      "Görünüşte mantıksız gelen bu davranış, adamın bir fiziksel özelliğinden kaynaklanıyor."
    ]
  },
  {
    id: "pencere-atlayan",
    title: "Pencereden Atlayan Adam",
    scenario: "Bir adam 50 katlı bir binanın penceresinden atlar ama çizik bile almadan kurtulur. Nasıl?",
    solution: "Adam zemin kattan atlamıştır. 50 katlı bir binanın penceresi demek illa yüksek kat demek değil!",
    difficulty: 1,
    hints: [
      "Bu adam bunu korkmadan ve normal bir şeymiş gibi yaptı."
    ]
  },
  {
    id: "olum-tarlasi",
    title: "Tarladaki Ceset",
    scenario: "Bir adam bir tarlada ölü bulunur. Etrafta başka kimse ve hiçbir ayak izi yoktur. Adam nasıl öldü?",
    solution: "Adam paraşütle atlıyordu ama paraşütü açılmadı. Sırt çantasındaki paraşüt açılmayınca tarlaya çakıldı.",
    difficulty: 2,
    hints: [
      "Adam ekstremsporları seviyordu."
    ],
    customRules: "Adamın 'paraşütle atladığı' veya tarlaya 'düştüğü' bilgisi asıl sürprizdir. Oyuncu bu kavramları (paraşüt, düşmek, uçak vb.) kendisi telaffuz edene kadar, cevaplarında bu bilgileri KESİNLİKLE ağzından kaçırma."
  },
  {
    id: "karanlik-tren",
    title: "Tüneldeki Tren",
    scenario: "Bir adam trende yolculuk yaparken aniden kalp krizi geçirerek ölür. Eğer trenin sigara içilen vagonunda olsaydı ölmeyecekti. Neden?",
    solution: "Yaşlı adam yıllardır kördü ve yeni bir ameliyatla gözleri açılmıştı. Hastaneden evine dönüyordu. Dünyayı tekrar görebildiği için çok mutluydu ama tekrar kör olmaktan da çok korkuyordu. Tren bir tünele girdiğinde her yer kapkaranlık oldu. Adam tekrar kör olduğunu sandı ve bu korkuyla kalp krizi geçirdi. Eğer sigara içilen vagonda olsaydı, karanlıkta yanan sigara ateşlerini görecek ve kör olmadığını anlayacaktı.",
    difficulty: 3,
    hints: [
      "Adamın ölümü fiziksel bir sorun değil, ani bir korku yüzünden oldu."
    ],
    customRules: "- Adamın körlükten yeni kurtulduğunu oyuncu bulana kadar söyleme. 'Göz', 'görme', 'körlük' gibi kelimeler kullanma."
  },
  {
    id: "restoran-silah",
    title: "Silahlı Barmen",
    scenario: "Bir kadın bir bara girer ve barmenden bir bardak su ister. Barmen kadına silah doğrultur. Kadın teşekkür eder ve restorandan çıkar. Neden?",
    solution: "Kadının hıçkırığı vardı. Su istedi ama barmen onu korkutarak hıçkırığını geçirmek istedi. Kadın hıçkırığı geçtiği için teşekkür etti.",
    difficulty: 2,
    hints: [
      "Barmenin sert tepkisi aslında garip bir tedavi yöntemiydi."
    ],
    customRules: "- Kadının 'hıçkırığı' vardı. Ancak oyuncu 'Kadın hasta mı?', 'Bir hastalığı mı var?' veya 'Fiziksel bir sakatlığı mı var?' diye sorarsa HAYIR de. Çünkü hıçkırık bir hastalık değildir.\n- Oyuncu 'hıçkırık' veya 'korkutmak' kelimelerini bizzat kullanana kadar bu kelimeleri asla telaffuz etme. Oyuncu bu kelimeleri kullanarak soru sorarsa dürüstçe onayla."
  },
  {
    id: "tabuttaki-kurtulus",
    title: "Tabuttaki Kurtuluş",
    scenario: "Bir adam haksız yere hapse mahkum edilmiştir. Kaçmak için hapishanede ölenleri dışarı gömen mezarcıyla anlaşır: Mahkum öldüğünde adam ölünün olduğu tabuta saklanacak, mezarcı dışarıda onu gömdükten sonra gece gelip toprağı kazacak ve onu çıkaracaktır. Bir süre sonra alarm çalar ve bir mahkumun öldüğü duyurulur. Adam karanlıkta morgdaki tabuta girip kapağı kapatır. Tabut gömülür. Adam bir çakmak yakar ve yanındaki ölü yüzünden çığlık atar, diridiri gömüldüğünü anlar. Neden?",
    solution: "Çakmağı yaktığında tabuttaki cesedin anlaştığı \"mezarcı\"nın ta kendisi olduğunu görür. Onu gömenler başka gardiyanlar olmuştur ve onu toprağın altından çıkaracak kimse kalmamıştır.",
    difficulty: 2,
    hints: [
      "Adamın planı ona yardım edecek tek bir kişiye bağlıydı."
    ]
  },
  {
    id: "muzik-intihar",
    title: "Ölümün Müziği",
    scenario: "Bir adam arabasında giderken radyoyu açar, birkaç saniye dinler ve ardından kendini vurarak intihar eder. Neden?",
    solution: "Adam bir radyo DJ'idir. Karısını öldürmek için kusursuz bir cinayet planlar. Radyoya kesintisiz çalacak bir plak koyup stüdyodan gizlice çıkar, eve gidip karısını öldürür. Cinayet saatinde radyoda yayında olduğu için polise sunacağı mükemmel bir mazereti vardır. Ancak stüdyoya geri dönerken arabasında radyoyu açar ve plağın takıldığını duyar. Mazeretinin çöktüğünü ve cinayetten tutuklanacağını anlayan adam çaresizlikle intihar eder.",
    difficulty: 3,
    hints: [
      "Radyoda duyduğu detay, mükemmel sandığı planının suya düştüğünün kanıtıydı."
    ],
    customRules: "- Oyuncunun sorularına SADECE doğrudan cevap ver. Örneğin 'Radyoyu dinlemeseydi de ölecek miydi?' sorusuna HAYIR denmelidir; çünkü radyodaki sesi duymasaydı o an intihar etmeyecekti.\n- DİKKAT: Radyoda çalan şey bir ŞARKI/MÜZİKTİR (Müzik plağı). Oyuncu 'şarkı mıydı?', 'şarkıyı söyleyen...' gibi sorular sorarsa radyoda çalanın şarkı olduğunu KESİNLİKLE reddetme ve onayla."
  },
  {
    id: "colgede-adam",
    title: "Kırık Kibrit",
    scenario: "Çölün ortasında ölü bir adam bulunur. Elinde yarısı kırık bir kibrit var. Etrafta hiçbir iz yok. Adam nasıl öldü?",
    solution: "Adam ve birkaç kişi sıcak hava balonuyla uçuyorlardı. Balon düşmeye başladı ve yükü hafifletmek için eşyaları attılar. Yetmedi, kura çektiler - en kısa çöpü (kırık kibriti) çeken adam balondan atlayacaktı. Adam kısa kibriti çekti ve atladı.",
    difficulty: 2,
    hints: [
      "Elindeki nesne, şanssız sonuçlanan bir kumarın kanıtıdır."
    ]
  },
  {
    id: "ikizler",
    title: "Kız Kardeşler",
    scenario: "İki kız kardeş aynı yıl, aynı ay, aynı gün, aynı saatte, aynı anne ve babadan doğmuşlardır. Ama ikiz değillerdir. Bu nasıl mümkün?",
    solution: "Üçüz kardeştirler. İkiz olmamak, ikiden fazla kardeş olabilecekleri anlamına gelir.",
    customRules: "- Bu hikayede ana gizem kardeşlerin 'üçüz' (veya dördüz vb.) olmasıdır. Oyuncu 'üçüz' kelimesini kullanmadan veya 'iki kardeşten fazlalar mı?' diye sormadan asla üçüncü bir kişiden bahsetme.\n- Oyuncu 'üçüz' kelimesini bulana kadar sadece sorulan detayı onayla. Örneğin '3. bir çocuk mu var?' sorusuna sadece 'EVET' de ve 'Evet, ailede doğum günü aynı olan sadece iki kişi yok' gibi kapalı bir açıklama yap. 'Üçüz' kelimesini ASLA sen kullanma.",
    difficulty: 1,
    hints: [
      "Kalabalık bir ailelerdi."
    ]
  },
  {
    id: "yemek-olum",
    title: "Martı Eti",
    scenario: "Bir adam bir restoranda martı eti sipariş eder. Bir çatal alır, hesabı öder, kapıdan çıkıp intihar eder. Neden?",
    solution: "Adam daha önce bir uçak kazası geçirmiş ve bir adada mahsur kalmıştı. Yardım gelene kadar bir şeyler yemek zorundalardı. Kazada o kör olmuştu, karısı da hayatını kaybetmişti. Ona yediği şeyin o an adada uçan martılar olduğunu söyleyerek karısının cansız bedenini yedirdiler. Adam hayatta kaldı. Yıllar sonra gerçek martı etini tattığında, adada yediği şeyin karısı olduğunu anladı.",
    customRules: "- DİKKAT (BAĞLAM KARIŞIKLIĞI): Oyuncunun sorusu adamın 'GEÇMİŞTE (adada) yediği şey' ile mi yoksa 'ŞU AN (restoranda) yediği şey' ile mi ilgili; bunu KESİNLİKLE birbirine karıştırma.\n- Eğer oyuncu 'Adamın (geçmişte/adada) yediği şey bir hayvan mıydı?' veya türevi (kuş mu, balık mı vs) sorarsa KESİNLİKLE 'HAYIR' cevabı ver. (Çünkü yediği şey bir İNSANdı - karısının cesedi). İnsanın bilimsel/biyolojik olarak hayvanlar aleminde sayılması bu oyunda GEÇERSİZDİR (Oyuncu açıkça 'bakteri, arke, protista, bitki, mantar, hayvan alemi' gibi spesifik taksonomi sormasa bile). İnsan dışı bir canlı kastedilmediği sürece insan için 'hayvan' denemez.\n- Eğer oyuncu 'Adamın (restoranda) yediği şey bir hayvan mıydı/kuş muydu?' diye sorarsa 'EVET' cevabı ver. (Çünkü restoranda okuduğu hikayedeki gibi gerçekten de bir martı yedi).\n- Eğer oyuncunun 'hayvan mıydı?' diye sorarken hangi zamandan (restoran mı, geçmiş/ada mı) bahsettiği belli değilse, 'Daha açık sorar mısın? (Restoranda yediği mi yoksa adada/geçmişte yediği mi?)' gibi bir yönlendirme yap.",
    difficulty: 3,
    hints: [
      "Adamın tattığı bu yeni lezzet, onu geçmişindeki acı bir yalanla yüzleştirdi."
    ]
  },
  {
    id: "kapali-oda-buz",
    title: "Ekipmansız Ölüm",
    scenario: "İçeriden kilitli bir odada bir adam asılmış halde bulunur. Odada sadece bir su birikintisi var. Odada başka ne mobilya ne de bir nesne var. Kendini nasıl astı?",
    solution: "Adam büyük bir buz bloğunun üzerine çıktı, ipi bağladı ve boynuna geçirdi. Buz eriyince asılı kaldı. Su birikintisi erimiş buzdan kalmıştır.",
    difficulty: 2,
    hints: [
      "Odada hedefe ulaşmasını sağlayan bir basamak vardı, ancak zamanla form değiştirdi."
    ]
  },
  {
    id: "telefon-cinayet",
    title: "Telefon Görüşmesi",
    scenario: "Bir adam karısını aramak ister. Hattın diğer ucunda bir erkek sesi duyar ve hemen telefonu kapatır. Adam gülümser. Neden?",
    solution: "Adam yanlış numara çevirmiştir. Telefonu açan kişi karısı değil, yanlış numara çevirdiği bir yabancıdır. Erkek sesi duyunca yanlış numara çevirdiğini anlamıştır ve kendi hatasına gülmüştür.",
    difficulty: 1,
    hints: [
      "Duyduğu ses bir tehlike ya da ihanetin değil, masum bir hatanın sonucuydu."
    ]
  },
  {
    id: "kargo-ucak",
    title: "Kargo Uçağı",
    scenario: "Bir pilot Sahra Çölü üzerinden uçmaktadır. Uçakta arıza çıkar ve pilot paraşütle atlayıp kendini kurtarır. Uçaksa ne yazık ki düşmüştür. Ertesi gün uçağın enkazı bulunur. Şaşırtıcı olan, uçağın düştüğü yerde 20 ceset vardır. Pilot tek başına uçuyordu. Cesetler nereden geldi?",
    solution: "Uçak bir kargo uçağıydı ve dondurulmuş insan cesetleri taşıyordu. Uçaklar bazen cenaze nakli yapar. Uçak düşünce cesetler de ortaya saçıldı.",
    difficulty: 1,
    hints: [
      "Bulunan bedenler uçağın düşmesinin kurbanları değildiler."
    ]
  },
  {
    id: "kum-saati",
    title: "Bıçak Değil Köprüüstü",
    scenario: "İki ülke birbiriyle savaştadır ve bu ülkelerin vatandaşları birbirinin ülkesine giremezler. Adamın biri, nolursa olsun bu iki ülkeyi bağlayan köprüyü geçmelidir. Neyse ki köprünün nöbetçisi sadece 5 dakikada bir dışarı bakmaktadır. Ama sorun şudur ki adam köprüyü 8 dakikada anca geçebilmektedir. Adam bu köprüyü nasıl geçer?",
    solution: "Adam köprüye girer, 4.5 dakika yürür ve sonra arkasını döner, sanki karşı taraftan geliyormuş gibi yapar. Nöbetçi onu görünce geri gönderir - yani aslında karşıya geçmiş olur!",
    difficulty: 2,
    hints: [
      "Adam geçişi tamamlamak için nöbetçilerin reflekslerini kurnazca kullanıyor."
    ]
  },
  {
    id: "romeo-juliet",
    title: "Zavallı Romeo ve Juliet",
    scenario: "Yerde kırık camlar ve bir su birikintisi var. Romeo ve Juliet odada ölü yatmaktadır. Odada başka hiç kimse yok. Acaba onlara ne oldu?",
    solution: "Romeo ve Juliet iki akvaryum balığıdır. Rüzgar pencereyi sertçe açmış ve akvaryumu devirip kırmıştır. Susuz kaldıkları için balıklar ölmüştür.",
    difficulty: 1,
    hints: [
      "Romeo ve Juliet insan olmak zorunda değil."
    ],
    customRules: "- Oyuncu Romeo ve Juliet'in insan olduğunu düşünerek sorular sorarsa, 'İnsanlar mıydı?' sorusuna HAYIR cevabı vermelisin."
  },
  {
    id: "gece-uykusu",
    title: "Uykuya Dalış",
    scenario: "Bir adam gecenin köründe uyuyamamaktadır, sinirle yatakta dönüp durur. Sonunda telefonu eline alır, bir numarayı tuşlar. Karşı taraf telefonu açınca hiçbir şey söylemeden telefonu kapatır ve saniyeler içinde huzurla uykuya dalar. Neden?",
    solution: "Yan odadaki (veya komşu dairesindeki) komşusu çok yüksek sesle horluyordur ve bu yüzden adam uyuyamamaktadır. Komşusunu arayıp onun uyanmasını ve telefonun başına gitmesini sağlamış, böylece horlamayı kesmiştir. Sessizlik sağlandığında adam hemen uyumuştur.",
    difficulty: 2,
    hints: [
      "Telefonun çalması karşıdaki kişinin bir eylemini kesmesine neden oldu."
    ]
  },
  {
    id: "olumcul-ayakkabi",
    title: "Ölümcül Ayakkabı",
    scenario: "Bir adam kendine yeni ayakkabılar alır ve bu ayakkabıları giyip işe gittiği gün hayatını kaybeder. Eğer eski ayakkabılarını giyseydi ölmeyecekti. Adamın işi nedir ve nasıl ölmüştür?",
    solution: "Adam bir sirkte bıçak atıcısının asistanıdır (hedef tahtasının önünde duran kişi). Her gün aynı ayakkabılarla oraya çıkar ve bıçak atıcısı onun boyuna göre ezberlediği kas hafızasıyla bıçakları atar. Yeni ayakkabılar adamın boyunu birkaç santim uzatmış ve topukludur. Bıçak atıcısı bıçağı her zamanki gibi tam hedef tahtasının üstüne fırlattığında bıçak adamın kafasına saplanmıştır.",
    difficulty: 3,
    hints: [
      "Adamın mesleği fiziksel hassasiyet ve milimetrik ölçümler gerektiriyordu."
    ],
    customRules: "- Oyuncunun adamın bir asistan olduğunu ve sirke/gösteriye çıktığını bulması gerekiyor. 'Adam asistan mı?', 'Gösteride miydi?' gibi soruları EVET diyerek yönlendir."
  },
  {
    id: "isik-yok",
    title: "Işık Yok",
    scenario: "Adam gece yatağından uyanır, aniden ayağa fırlar ve ağlamaya başlar. Koşarak evden dışarı çıkar ve evinin hemen yanındaki binanın düğmesine basar ama çok geç kalmıştır, uzaktan çığlık sesleri duyar ve kendini yere atar. Neden?",
    solution: "Adam bir deniz feneri bekçisidir. Uyanıp fenerin ışığını yakmayı unuttuğunu fark etmiştir. Gece karanlığında sise/kayalıklara giren bir gemi kayalıklara çarpmış ve içindeki insanlar ölmüştür, duyduğu çığlıklar batan gemiden gelmektedir.",
    difficulty: 3,
    hints: [
      "Adamın evi, bu işi yapanlar için tahsis edilmiş bir evdi."
    ]
  },
  {
    id: "yasa-disi-giris",
    title: "Yasa Dışı Giriş",
    scenario: "Bir kişi, \"Tek Yön\" tabelası olan bir sokağa ters yönden girer. O sırada sokakta nöbet tutan bir polis memuru onu doğrudan görür ama hiçbir müdahalede bulunmaz veya ceza yazmaz. Polis memuru neden görevini yapmamıştır?",
    solution: "Sokağa giren kişi araba kullanmıyordu, yaya olarak yürüyordu. Tek yön kuralları yayalar için değil araçlar için geçerlidir.",
    difficulty: 2,
    hints: [
      "Ortada bir kural ihlali yok, adamın sokağa girme şeklini düşünün."
    ]
  },
  {
    id: "kral-zehir",
    title: "Kralın Şarabı",
    scenario: "Bir kral düşmanından bir şişe şarap hediye alır. Şarabın zehirli olup olmadığını anlamak ister. Hapiste idam cezası bekleyen mahkumları kullanmaya karar verir. Tam olarak hangi şişenin zehirli olduğunu bulmak için 10 şişe şarabı ve 4 mahkumu kullanabilir. Ertesi gün büyük bir ziyafet verecektir. Zehir 24 saat içinde etki eder. Kral bunu nasıl başarır?",
    solution: "İkili (binary) sistem kullanır. 4 mahkumla 2^4 = 16 farklı kombinasyon test edilebilir. Her şişeye 1-10 arası numara verilir ve ikilik sistemde yazılır. Her mahkum bir bit'i temsil eder. Mahkum o şişenin ikilik gösteriminde kendi bit'i 1 olan şişeleri içer. Ertesi gün ölen mahkumlara bakarak zehirli şişe bulunur.",
    difficulty: 3,
    hints: [
      "Kralın çözümü basit bir deneme yanılma değil, matematiksel bir dizilime dayanıyor."
    ],
    customRules: "- Çözüm değerlendirmesinde oyuncunun şarapların mahkumlara test edilmesini 'binary', 'ikili sistem', 'bit ataması' gibi teknik bilişim terimleriyle açıklamasını DOĞRU kabul edebilmen için, bu terimlerin doğru bir deneme/bölme/eşleştirme mantığıyla kullanılmış olması KESİNLİKLE ŞARTTIR. Oyuncu saçma bir mantık (ör. herkes 2.5 şişe içer, vs.) uydurup arasına 'binary', '00001011' sıkıştırarak çözümü atlatmaya çalışırsa DOĞRU VERME; çözümü sadece 'kelime avcısı' gibi değerlendirme, kurulan mantığa bak."
  }
];

export { STORIES };
