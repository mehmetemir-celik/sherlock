// Sherlock Yes/No - Lateral Thinking Bulmaca Veritabanı
const STORIES = [
  {
    id: "adam-ve-asansor",
    title: "Çıkmayan Asansör",
    scenario: "Bir adam, bir binanın 15. katında yaşıyor. Her sabah asansöre biner, zemin kata iner ve işe gider. Akşam döndüğünde ise asansöre biner, 7. kata çıkar ve kalan 8 katı yürüyerek çıkar. Yağmurlu günlerde ise doğrudan 15. kata çıkar. Neden?",
    solution: "Adam çok kısadır. Asansör düğmelerinde sadece 7. kata kadar uzanabilir. Yağmurlu günlerde şemsiyesi olur ve şemsiyesiyle 15. kat düğmesine basabilir.",
    difficulty: 2,
    hints: [
      "Görünüşte mantıksız gelen bu davranış, adamın bir fiziksel özelliğinden kaynaklanıyor."
    ],
    customRules: "Bu hikayede adam hayattadır ve her gün rutin işine gitmektedir. Oyuncu 'Adam öldü mü?' veya benzeri bir yaşam/ölüm sorusu sorarsa HAYIR cevabı ver ve ölmediğini, rutin bir hayatı olduğunu vurgula."
  },
  {
    id: "olum-tarlasi",
    title: "Tarladaki Ceset",
    scenario: "Bir adam bir tarlada ölü bulunur. Etrafta başka kimse ve hiçbir ayak izi yoktur. Adam nasıl öldü?",
    solution: "Adam paraşütle atlıyordu ama paraşütü açılmadı. Sırt çantasındaki paraşüt açılmayınca tarlaya çakıldı.",
    difficulty: 1,
    hints: [
      "Adam ekstremsporları seviyordu."
    ],
    customRules: "Adamın 'paraşütle atladığı' veya tarlaya 'düştüğü' bilgisi asıl sürprizdir. Oyuncu henüz bu bilgiyi kendisi bulmadan, cevaplarında 'adamın düştüğü', 'yüksekten atladığı', 'havadan geldiği' gibi bilgileri KESİNLİKLE ağzından kaçırma."
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
    customRules: "- Kadının 'hıçkırığı' vardı. Ancak oyuncu 'Kadın hasta mı?', 'Bir hastalığı mı var?' veya 'Fiziksel bir sakatlığı mı var?' diye sorarsa HAYIR de. Çünkü hıçkırık bir hastalık değil geçici bir reflekstir.\n- Oyuncu bulana kadar 'hıçkırık', 'korkutmak' kelimelerini KESİNLİKLE ağzından kaçırma."
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
    customRules: "- Oyuncunun sorularına SADECE doğrudan cevap ver. Örneğin 'Radyoyu dinlemeseydi de ölecek miydi?' sorusuna HAYIR denmelidir; çünkü radyodaki sesi duymasaydı o an intihar etmeyecekti."
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
    customRules: "- Çözüm değerlendirmesinde oyuncu şarapların mahkumlara test edilmesini 'binary', 'ikili sistem', 'bit ataması' gibi teknik bilişim terimleriyle açıklarsa bunu DOĞRU Kabul et. Çözüm mantığı tamamen aynıdır."
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
  }
];

export { STORIES };
